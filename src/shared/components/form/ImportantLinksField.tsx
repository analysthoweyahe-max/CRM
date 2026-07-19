import { FormField } from '@/shared/components/form/FormField';
import { ArrayInput } from '@/shared/components/form/ArrayInput';

interface Props {
  values:   string[];
  onChange: (next: string[]) => void;
  isAr:     boolean;
  error?:   string;
}

export function ImportantLinksField({ values, onChange, isAr, error }: Props) {
  function add() {
    onChange([...values, '']);
  }

  function update(i: number, v: string) {
    const next = [...values];
    next[i] = v;
    onChange(next);
  }

  function remove(i: number) {
    onChange(values.filter((_, idx) => idx !== i));
  }

  return (
    <FormField label={isAr ? 'روابط هامة' : 'Important Links'} error={error}>
      <ArrayInput
        values={values}
        type="url"
        placeholder="https://..."
        addLabel={isAr ? 'إضافة رابط' : 'Add link'}
        onAdd={add}
        onUpdate={update}
        onRemove={remove}
        minItems={0}
        dir="ltr"
        error={!!error}
      />
    </FormField>
  );
}
