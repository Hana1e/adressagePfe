import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserSchema } from 'src/users/schemas/user.schema';
import { DataSchema } from 'src/data/schemas/data.schema'; 

export enum Type {
    RESIDENTIELLE = ' RESIDENTIELLE',
    COMMERCIALE = 'COMMERCIALE',
    INDUSTRIELLE = 'INDUSTRIELLE',
    RURAL = 'RURAL',
    MIXTE = 'MIXTE',
}

@Schema({
    timestamps: true,
})
export class Enquete extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    enqueteurId: Types.ObjectId;
    @Prop({ required: true })
    enqueteurName: string; 

    @Prop({ type: Types.ObjectId, ref: 'Data', required: true })
    layerId: Types.ObjectId;
    @Prop({ required: true })
    layerName: string;


    @Prop({ enum: Type, required: true })
    type: Type;

    @Prop({ required: true })
    dateAttribution: Date;

}
export type EnqueteDocument = Enquete & Document;
export const EnqueteSchema = SchemaFactory.createForClass(Enquete);
