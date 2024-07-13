// polyline.service.ts
import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Polyline, PolylineDocument } from './schemas/polyline.schema';
import { CreatePolylineDto } from './dtos/polyline.dto';
import * as turf from '@turf/turf';
import { PolygonDocument } from './schemas/polygon.schema';
import { PolygonService } from './polygon.service';
import mongoose from 'mongoose';


@Injectable()
export class PolylineService {
    constructor(
        @InjectModel('Polyline') private polylineModel: Model<PolylineDocument>,
        private polygonService: PolygonService
    ) {}

    async createPolyline(createPolylineDto: CreatePolylineDto): Promise<Polyline> {
        try {
            const newPolyline = new this.polylineModel(createPolylineDto);
            return await newPolyline.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to save polyline data');
        }
    }

    async getPolylinesByUserId(userId: string): Promise<any[]> {
        try {
            return await this.polylineModel.find({ createdBy: userId }, 'geoJSON _id').exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch polylines for the user');
        }
    }

    async deletePolyline(id: string): Promise<any> {
        try {
            return await this.polylineModel.findByIdAndDelete(id).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to delete polyline');
        }
    }

    async getPolylineById(id: string): Promise<Polyline> {
        try {
            const polyline = await this.polylineModel.findById(id).exec();
            console.log('Polyline:', polyline); // Ajoutez ceci pour voir si une polyline est récupérée
            if (!polyline) {
                throw new NotFoundException('Polyline not found');
            }
            return polyline;
        } catch (error) {
            console.error('Error fetching polyline:', error); // Ajoutez ceci pour voir les erreurs
            throw new InternalServerErrorException('Failed to fetch polyline by ID');
        }
    }
    async getAddressFromPolylineId(polylineId: string): Promise<string> {
        try {
            const polyline = await this.polylineModel.findById(polylineId).exec();
            if (!polyline) {
                throw new NotFoundException('Polyline not found');
            }
            return polyline.adresse;
        } catch (error) {
            console.error('Error fetching polyline address:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to fetch polyline address');
        }
    }

    async getAllAddresses(): Promise<string[]> {
        try {
            const addresses = await this.polylineModel.distinct('adresse').exec();
            return addresses;
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch addresses');
        }
    }
    
    async getPolylineByAddress(address: string): Promise<{ id: string, geoJSON: any } | null> {
        try {
            const polyline = await this.polylineModel.findOne({ adresse: address }, 'geoJSON _id').exec();
            return polyline ? { id: polyline._id, geoJSON: polyline.geoJSON } : null;
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch polyline by address');
        }
    }
    
    async addReferencePoint(polylineId: string, referencePoint: any): Promise<Polyline> {
        try {
            const polyline = await this.polylineModel.findById(polylineId).exec();
            if (!polyline) {
                throw new NotFoundException('Polyline not found');
            }
    
            if (polyline.referencePoint) {
                throw new BadRequestException('Polyline already has a reference point');
            }
    
            polyline.referencePoint = referencePoint;
            return await polyline.save();
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to add reference point to polyline');
        }
    }

    async getPolylineReferencePoint(polylineId: string): Promise<any> {
        try {
            const polyline = await this.polylineModel.findById(polylineId).exec();
            if (!polyline) {
                throw new NotFoundException('Polyline not found');
            }
            return polyline.referencePoint;
        } catch (error) {
            console.error('Error fetching polyline reference point:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to fetch polyline reference point');
        }
    }
    async getVoiesDetailsByUserId(userId: string): Promise<{ totalQuartiers: number, voiesDetails: { quartier: string, voies: { adresse: string }[] }[] }> {
        try {
          const totalQuartiers = await this.polylineModel.distinct('nomQuartier').exec().then(quarters => quarters.length);
          const voiesDetails = await this.polylineModel.aggregate([
            { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
            {
              $group: {
                _id: "$nomQuartier",
                voies: { $push: { adresse: "$adresse" } }
              }
            },
            { $project: { _id: 0, quartier: "$_id", voies: 1 } }
          ]).exec();
    
          return { totalQuartiers, voiesDetails };
        } catch (error) {
          throw new InternalServerErrorException('Failed to fetch voies details by quartier');
        }
      }
    
      async getReferencePointByAddress(address: string): Promise<any> {
        try {
            const polyline = await this.polylineModel.findOne({ adresse: address }, 'referencePoint').exec();
            if (!polyline) {
                throw new NotFoundException('Address not found');
            }
            if (!polyline.referencePoint) {
                return null;
            }
            return polyline.referencePoint;
        } catch (error) {
            console.error('Error fetching reference point by address:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to fetch reference point by address');
        }
    }


      //______________________________
      //pour websig
      async searchAddresses(query: string): Promise<string[]> {
        try {
            // Recherche des adresses en fonction de la pertinence (par exemple, basée sur la similitude avec la requête)
            const addresses = await this.polylineModel
                .find({ adresse: { $regex: query, $options: 'i' } })
                .distinct('adresse')
                .exec();
    
            // Séparation des adresses contenant la lettre spécifiée au début et celles qui ne le contiennent pas
            const addressesStartingWithQuery = [];
            const addressesNotStartingWithQuery = [];
            addresses.forEach(address => {
                if (address.toLowerCase().startsWith(query.toLowerCase())) {
                    addressesStartingWithQuery.push(address);
                } else {
                    addressesNotStartingWithQuery.push(address);
                }
            });
    
            // Tri des adresses commençant par la lettre spécifiée en premier
            addressesStartingWithQuery.sort();
    
            // Concaténation des deux ensembles d'adresses
            const sortedAddresses = addressesStartingWithQuery.concat(addressesNotStartingWithQuery);
    
            return sortedAddresses;
        } catch (error) {
            throw new InternalServerErrorException('Failed to search addresses');
        }
    }
      async getAddressGeometry(adresse: string): Promise<any> {
        try {
          const polyline = await this.polylineModel.findOne({ adresse }).select('geoJSON').exec();
          if (polyline) {
            return polyline.geoJSON;
          } else {
            throw new NotFoundException('Address not found');
          }
        } catch (error) {
          throw new InternalServerErrorException('Failed to get address geometry');
        }
      }
      async checkIntersection(latitude: number, longitude: number): Promise<{ adresse?: string }> {
        try {
            const point = turf.point([longitude, latitude]);
            const allPolylines = await this.polylineModel.find().exec();

            for (const polyline of allPolylines) {
                const polylineGeoJSON = polyline.geoJSON;

                // Vérifiez l'intersection entre la polyligne et le point
                const intersects = turf.booleanPointOnLine(point, polylineGeoJSON);

                if (intersects) {
                    // Si le point intersecte la polyligne, retournez l'adresse associée
                    return { adresse: polyline.adresse };
                }
            }

            // Si aucun point n'intercepte aucune polyligne, retournez une adresse vide
            return { adresse: undefined };
        } catch (error) {
            throw new InternalServerErrorException('Failed to check intersection');
        }
    }

}
