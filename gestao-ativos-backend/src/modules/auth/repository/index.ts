import { LoginRepository } from './login/login.repository';
// import { RegisterService } from './register/register.repository';
// import { ValidateService } from './validate/validate.repository';

export * from './login/login.repository';
// export * from './register/register.service';
// export * from './validate/validate.service';

export const AUTH_REPOSITORIES = [LoginRepository];
