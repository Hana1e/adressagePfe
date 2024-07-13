import { Injectable , InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Recensement, RecensementDocument } from './schemas/recensement.schema';
import { CreateRecensementDto } from './dtos/recensement.dto';

@Injectable()
export class ModeRecensementService {
    constructor(@InjectModel('Recensement') private recensementModel: Model<RecensementDocument>) {}

    async create(createRecensementDto: CreateRecensementDto): Promise<Recensement> {
        try {
            const newRecensement = new this.recensementModel(createRecensementDto);
            return await newRecensement.save();
            
        } catch (error) {
            throw new InternalServerErrorException('Erreur lors de la sauvegarde des données');
        }
    }
    
    async getGeometryByUserId(userId: string): Promise<any[]> {
        try {
            return await this.recensementModel.find({ createdBy: userId }, 'geoJSON _id').exec();
        } catch (error) {
            throw new InternalServerErrorException('Erreur lors de la récupération des données');
        }
    }
    
    async delete(id: string): Promise<any> {
        console.log(`Attempting to delete geometry with ID: ${id}`);
        try {
            const result = await this.recensementModel.findByIdAndDelete(id).exec();
            if (!result) {
                console.error('No record found with ID:', id);
                throw new InternalServerErrorException('Deletion failed, ID not found');
            }
            console.log('Deletion successful:', result);
            return result;
        } catch (error) {
            console.error('Error during deletion:', error);
            throw new InternalServerErrorException('Erreur lors de la suppression des données');
        }
    }
    
    
    
   
}