export default {
  validator: {
    errors: {
      emptyValueError: 'Поле [{field}] не может быть пустым.',
      numericValueError: 'Значение поля [{field}] должно быть числом.',
      booleanValueError: 'Значение поля [{field}] должно быть true или false.',
      dateValueError: 'Значение поля [{field}] должно быть датой',
      minLengthValueError: 'Длина значения [{field}] не должна быть меньше {length}.',
      maxLengthValueError: 'Длина значения [{field}] не должна превышать {length}.'
    }
  }
}
