import { z } from 'zod';
import { makeBonusSchema } from '../schemas/addBonus.schema';

export type AddBonusFormValues = z.infer<ReturnType<typeof makeBonusSchema>>;
