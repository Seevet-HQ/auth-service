import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

// Custom password strength validator
function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          // Check minimum length
          if (value.length < 12) return false;
          
          // Check for at least one uppercase letter
          if (!/[A-Z]/.test(value)) return false;
          
          // Check for at least one lowercase letter
          if (!/[a-z]/.test(value)) return false;
          
          // Check for at least one number
          if (!/\d/.test(value)) return false;
          
          // Check for at least one special character
          if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) return false;
          
          // Check for common weak patterns
          const weakPatterns = [
            'password', '123456', 'qwerty', 'admin', 'letmein',
            'welcome', 'monkey', 'dragon', 'master', 'hello'
          ];
          
          if (weakPatterns.some(pattern => value.toLowerCase().includes(pattern))) {
            return false;
          }
          
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must be at least 12 characters and contain uppercase, lowercase, number, and special character';
        },
      },
    });
  };
}

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(3)
  username: string;

  @Field()
  @IsString()
  @IsStrongPassword()
  password: string;

  @Field()
  @IsString()
  firstName: string;

  @Field()
  @IsString()
  lastName: string;
}
