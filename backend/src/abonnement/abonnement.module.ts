import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { EntrepriseSchema } from './schemas/entreprise.schema';
@Module({imports: [MongooseModule.forFeature([{name:'Entreprise' , schema:EntrepriseSchema}])]
})
export class AbonnementModule {
    
}
