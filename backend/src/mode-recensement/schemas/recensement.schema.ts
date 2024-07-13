import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type RecensementDocument = Recensement & Document;

@Schema({
    timestamps:true,
})
export class Recensement {
    @Prop({ required: true, type: MongooseSchema.Types.Mixed })//pour data qui varient en structure
    geoJSON: any;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    createdBy: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    nomEntite: string;
    @Prop({ type: String, required: true }) // Ajout du champ pour le type de voie
    typsedevoie: string;
}

export const RecensementSchema = SchemaFactory.createForClass(Recensement);
