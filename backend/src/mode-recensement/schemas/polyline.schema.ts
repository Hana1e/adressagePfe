// polyline.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PolylineDocument = Polyline & Document;

@Schema({
    timestamps: true,
})
export class Polyline {
    @Prop({ required: true, type: MongooseSchema.Types.Mixed })
    geoJSON: any;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    createdBy: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    nomOfficiel: string;
    @Prop({ required: true })
    nomUsage: string;
    @Prop({ required: true })
    typedevoie: string;
    @Prop() 
    numeroVoie?: string;

    @Prop({ required: true })
    statut: string;
    @Prop({ required: true })
    distance: string;
    @Prop() 
    nomQuartier ?: string;
    @Prop()
    quartierId?: string;
    @Prop()
    adresse?: string;
    @Prop({ type: MongooseSchema.Types.Mixed }) 
    referencePoint: any;
    

}

export const PolylineSchema = SchemaFactory.createForClass(Polyline);
