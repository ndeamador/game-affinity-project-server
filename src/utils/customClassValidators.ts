//https://github.com/typestack/class-validator#validation-decorators

import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import User from '../users/typeDef';


// // User already exists:
// @ValidatorConstraint({ async: true })
// export class DoesUserAlreadyExistConstraint implements ValidatorConstraintInterface {
//   validate(username: string) {
//     return User.findOne({ where: username }).then(user => {
//       if (user) return false;
//       return true;
//     });
//   }
// }

// export function DoesUserAlreadyExist(validationOptions?: ValidationOptions) {
//   return function (object: Object, propertyName: string) {
//     registerDecorator({
//       target: object.constructor,
//       propertyName: propertyName,
//       options: validationOptions,
//       constraints: [],
//       validator: DoesUserAlreadyExistConstraint,
//     });
//   };
// }




// Email already exists:
@ValidatorConstraint({ async: true })
export class DoesEmailAlreadyExistConstraint implements ValidatorConstraintInterface {
  validate(email: string) {
    return User.findOne({ where: { email } }).then(user => {
      if (user) return false;
      return true;
    });
  }
}

export function DoesEmailAlreadyExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: DoesEmailAlreadyExistConstraint,
    });
  };
}