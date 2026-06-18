import { z } from 'zod';
import { makeDeductionSchema } from '../schemas/addDeduction.schema';

export type AddDeductionFormValues = z.infer<ReturnType<typeof makeDeductionSchema>>;
