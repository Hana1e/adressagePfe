import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type PolygonDocument = Polygon & Document;
@Schema({
    timestamps: true,
})
export class Polygon extends Document {
    @Prop({ required: true, type: Object })
    geoJSON: any;

    @Prop({ required: true })
    createdBy: string;

    @Prop({ required: true })
    nomEntite: string;

    @Prop()
    nomQuartier?: string;
    @Prop()
    typeQuartier?: string;
    @Prop({ type: String })
    typeImmeuble?: string;

    @Prop()
    nomImmeuble?: string;

    @Prop()
    Quartier?: string;
    @Prop()
    nombreEtages?: string;
    @Prop({ required: true })
    area: string;
    @Prop() 
    layerId?: string;
    @Prop() 
    description?: string;
    @Prop() 
    adresseImmeuble?: string;
    @Prop()
    adresseFinalImmeuble?: string;
    @Prop() 
    distance?: number;
    @Prop() 
    rive?: string;
    @Prop({ type: Number })
    codePostal?: number;
    @Prop()
    codePostalQuartier?: number;
    
  @Prop({ type: Number })
  sequentialNumber?: number;

}

export const PolygonSchema = SchemaFactory.createForClass(Polygon);
