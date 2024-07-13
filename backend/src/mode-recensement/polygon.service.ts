import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Polygon, PolygonDocument } from './schemas/polygon.schema';
import { CreatePolygonDto } from './dtos/polygon.dto';
import { point, booleanPointInPolygon } from '@turf/turf'; 
@Injectable()
export class PolygonService {
    constructor(@InjectModel('Polygon') private polygonModel: Model<PolygonDocument>) {}

    async createPolygon(createPolygonDto: CreatePolygonDto): Promise<Polygon> {
        try {
            console.log('Nom du quartier reçu :', createPolygonDto.nomQuartier);
            console.log('Type d\'immeuble reçu :', createPolygonDto.typeImmeuble);
            
            const newPolygon = new this.polygonModel(createPolygonDto);
            return await newPolygon.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to save polygon data');
        }
    }
    private async getLastSequentialNumber(address: string, rive: string): Promise<number> {
      const lastPolygon = await this.polygonModel.findOne({
          adresseFinalImmeuble: { $regex: address, $options: 'i' },
          rive: rive
      }).sort({ sequentialNumber: -1 }).exec();
      return lastPolygon?.sequentialNumber || 0;
  }
    //pour adressimmeuble apres numerotation
    async addFinalAddressImmeuble(
      polygonId: string, 
      adresseFinalImmeuble: string, 
      distance: number, 
      rive?: string, 
      sequentialNumber?: number
  ): Promise<Polygon> {
      try {
          const polygon = await this.polygonModel.findById(polygonId);
          if (!polygon) {
              throw new NotFoundException('Polygon not found');
          }
          if (polygon.nomEntite !== 'immeuble') {
              throw new BadRequestException('L\'adresse finale ne peut être ajoutée que pour les entités de type "immeuble".');
          }

          // Obtenir le dernier numéro séquentiel et l'incrémenter si non fourni
          if (!sequentialNumber) {
              sequentialNumber = await this.getLastSequentialNumber(adresseFinalImmeuble, rive) + 1;
          }

          // Obtention du nom du quartier
          const nomQuartier = await this.getQuartierNameById(polygon.Quartier);

          // Construction de l'adresse complète
          let adresseComplete = `${nomQuartier} ${adresseFinalImmeuble} N ${distance}${rive ? `, ${rive}` : ''} ${sequentialNumber || ''}, ${polygon.codePostalQuartier} TANGER`.trim();

          polygon.adresseFinalImmeuble = adresseComplete;
          polygon.distance = distance;
          polygon.sequentialNumber = sequentialNumber;
          polygon.rive = rive;

          return await polygon.save();
      } catch (error) {
          console.error('Failed to add final address for immeuble:', error);
          throw new InternalServerErrorException('Failed to add final address for immeuble');
      }
  }
    async getSequentialNumberByPartialAddress(address: string): Promise<number[]> {
      try {
          const polygons = await this.polygonModel.find({ adresseFinalImmeuble: { $regex: address, $options: 'i' } });
          if (!polygons || polygons.length === 0) {
              throw new NotFoundException('No polygons found with the given address');
          }
          return polygons.map(polygon => polygon.sequentialNumber);
      } catch (error) {
          console.error('Failed to get sequential numbers by address:', error);
          throw new InternalServerErrorException('Failed to get sequential numbers by address');
      }
  }

   
  
  
  
  
  

  
    

  async doesAddressWithSameDistanceExist(address: string, distance: number): Promise<boolean> {
    try {
        // Vérifier si un immeuble a la même adresse finale et la même distance
        const count = await this.polygonModel.countDocuments({ adresseFinalImmeuble: { $regex: address, $options: 'i' }, distance: distance }).exec();
        return count > 0;
    } catch (error) {
        console.error('Failed to check address with same distance:', error);
        throw new InternalServerErrorException('Failed to check address with same distance');
    }
}
  
async getCodePostalQuartier(quartierId: string): Promise<number | undefined> {
  try {
      const quartier = await this.polygonModel.findById(quartierId);
      if (quartier) {
          return quartier.codePostal;
      } else {
          throw new NotFoundException('Quartier not found');
      }
  } catch (error) {
      console.error('Error fetching postal code for quartier:', error);
      throw new InternalServerErrorException('Failed to retrieve postal code for quartier');
  }
}


  async findAddressesWithStreet(address: string, distance: number): Promise<Polygon[]> {
    const addresses = await this.polygonModel.find({
      adresseFinalImmeuble: { $regex: address, $options: 'i' },
      distance: distance
    }).exec();
    return addresses;
  }
    
      
      async getQuartierNameById(quartierId: string): Promise<string> {
        try {
            const quartier = await this.polygonModel.findOne({ _id: quartierId, nomEntite: 'quartier' }, 'nomQuartier').exec();
            if (!quartier) {
                throw new NotFoundException('Quartier not found');
            }
            return quartier.nomQuartier;
        } catch (error) {
            console.error('Failed to get quartier name by ID:', error);
            throw new InternalServerErrorException('Failed to get quartier name by ID');
        }
    }
    
    
    
//pour afficher liste des quartiers
    async getQuartiers(): Promise<any[]> {
        try {
            return await this.polygonModel.find({ nomEntite: 'quartier' }, '_id nomQuartier').exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch quartiers');
        }
    }
    //pour afficher les quartiers  et les noms de quartiers et id
    async getQuartierGeometries(): Promise<any[]> {
        try {
            return await this.polygonModel.find({ nomEntite: 'quartier' }, '_id geoJSON nomQuartier').exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch quartier geometries');
        }
    }
    async getImmeubleAddresses(): Promise<any[]> {
        try {
            return await this.polygonModel.find(
                { nomEntite: 'immeuble' },
                '_id adresseImmeuble'
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch immeuble addresses');
        }
    }
    //pour immeuble adresseimmeuble for new drawn geometries
    async getAddressById(id: string): Promise<any> {
        try {
          const address = await this.polygonModel.findById(id, 'adresseImmeuble').exec();
          if (!address) {
            throw new NotFoundException('Address not found');
          }
          return address;
        } catch (error) {
          throw new InternalServerErrorException('Failed to fetch address');
        }
      }
    
    
    

    async getPolygonsByUserId(userId: string): Promise<any[]> {
        try {
            const polygons = await this.polygonModel.find({ createdBy: userId }).exec();
           // console.log('Polygons:', polygons); // Vérifiez les données retournées
            return polygons.filter(polygon => polygon.nomEntite !== 'quartier'); // Appliquer le filtre ici
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch polygons for the user');
        }
    }
    
    

    async deletePolygon(id: string): Promise<any> {
        try {
            return await this.polygonModel.findByIdAndDelete(id).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to delete polygon');
        }
    }
    async getQuartiersByUserId(userId: string): Promise<string[]> {
        try {
            const polygons = await this.polygonModel.find({ createdBy: userId, nomEntite: 'quartier' }).exec();
            return polygons.map(polygon => polygon.nomQuartier);
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch quartiers for the user');
        }
    }


    async getFinalAddressById(polygonId: string): Promise<string> {
        try {
            const polygon = await this.polygonModel.findById(polygonId);
            if (!polygon) {
                throw new NotFoundException('Polygon not found');
            }

            if (polygon.nomEntite === 'immeuble' && polygon.adresseFinalImmeuble) {
                return polygon.adresseFinalImmeuble;
            } else {
                throw new BadRequestException('Final address not available for this polygon');
            }
        } catch (error) {
            console.error('Failed to get final address by ID:', error);
            throw new InternalServerErrorException('Failed to get final address by ID');
        }
    }

    //pour webSig
    async searchEntities(letter: string): Promise<string[]> {
      try {
        const regex = new RegExp(letter, 'i');
        const entities = await this.polygonModel
          .find({
            $or: [
              { nomEntite: 'quartier', nomQuartier: { $regex: regex } },
              { nomEntite: 'immeuble', adresseImmeuble: { $regex: regex } }
            ]
          })
          .exec();
    
        const results: { name: string; startsWithLetter: boolean }[] = [];
        entities.forEach(entity => {
          if (entity.nomEntite === 'quartier' && entity.nomQuartier) {
            results.push({ name: entity.nomQuartier, startsWithLetter: entity.nomQuartier.toLowerCase().startsWith(letter.toLowerCase()) });
          } else if (entity.nomEntite === 'immeuble' && entity.adresseImmeuble) {
            results.push({ name: entity.adresseImmeuble, startsWithLetter: entity.adresseImmeuble.toLowerCase().startsWith(letter.toLowerCase()) });
          }
        });
    
        // Trier les résultats
        results.sort((a, b) => {
          if (a.startsWithLetter && !b.startsWithLetter) return -1;
          if (!a.startsWithLetter && b.startsWithLetter) return 1;
          return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
        });
    
        // Extraire les noms des résultats triés
        const sortedResults = results.map(result => result.name);
    
        return sortedResults;
      } catch (error) {
        throw new InternalServerErrorException('Failed to search entities containing letter');
      }
    }
    
    
      async getQuartierGeometry(nomQuartier: string): Promise<any> {
        try {
          const quartier = await this.polygonModel.findOne({ nomQuartier }).select('geoJSON').exec();
          if (quartier) {
            return quartier.geoJSON;
          } else {
            throw new NotFoundException('Quartier not found');
          }
        } catch (error) {
          throw new InternalServerErrorException('Failed to get quartier geometry');
        }
      }
      async getImmeubleGeometry(adresseImmeuble: string): Promise<any> {
        try {
          const immeuble = await this.polygonModel.findOne({ adresseImmeuble }).select('geoJSON').exec();
          if (immeuble) {
            return immeuble.geoJSON;
          } else {
            throw new NotFoundException('Immeuble not found');
          }
        } catch (error) {
          throw new InternalServerErrorException('Failed to get immeuble geometry');
        }
      }

      async checkIntersection(latitude: number, longitude: number): Promise<{ adresseImmeuble: string }> {
        try {
            const pt = point([longitude, latitude]);
            const polygons = await this.polygonModel.find({ nomEntite: 'immeuble' }).exec();
            
            for (const polygon of polygons) {
                const geoJSON = polygon.geoJSON;
                if (booleanPointInPolygon(pt, geoJSON)) {
                    return { adresseImmeuble: polygon.adresseImmeuble };
                }
            }
            return { adresseImmeuble: '' }; // No intersection found, return empty string
        } catch (error) {
            throw new InternalServerErrorException('Failed to check intersection');
        }
    }
    
    
    
      
      
      
      
      
      
}
