import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DataDocument = Data & Document;

@Schema({
    timestamps:true,
})
export class Data {
    
    @Prop({ required: true })
    layerName: string; 
    @Prop({ required: true, type: MongooseSchema.Types.Mixed })//pour data qui varient en structure
    geoJSON: any;

   
}

export const DataSchema = SchemaFactory.createForClass(Data);
