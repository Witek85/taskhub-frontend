import { DictionaryOptionResponse } from '@openapi/taskhub-service';

import { DictionaryOption } from '../models/dictionary-option.model';

export function mapDictionaryOptionFromApi<T extends string>(
  option: DictionaryOptionResponse,
): DictionaryOption<T> {
  return {
    label: option.label!,
    value: option.value as T,
  };
}
