import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'Match', async: false })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: any, validationArguments) {
    const [relatedPropertyName] = validationArguments.constraints;
    const relatedValue = (validationArguments.object as any)[
      relatedPropertyName
    ];
    return value === relatedValue;
  }
  defaultMessage?(args: ValidationArguments): string {
    const [relatedPropertyName] = args.constraints;
    return `${args?.property} must match ${relatedPropertyName}`;
  }
}
