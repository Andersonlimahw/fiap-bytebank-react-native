// Note: Using plain TS types to avoid external deps
export type UserSchema = {
  id: string;
  name: string;
  email: string;
};

export function validateUser(input: any): input is UserSchema {
  return (
    input &&
    typeof input.id === 'string' &&
    typeof input.name === 'string' &&
    input.name.length >= 2 &&
    typeof input.email === 'string' &&
    /.+@.+\..+/.test(input.email)
  );
}
