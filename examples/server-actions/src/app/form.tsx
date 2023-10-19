'use client';

import {
  experimental_useFormState as useFormState,
  experimental_useFormStatus as useFormStatus,
} from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '../../node_modules/@hookform/resolvers/zod';

import { login } from '@/app/actions';
import { schema } from '@/app/schema';

function SubmitButton() {
  const { pending } = useFormStatus();
  console.log('pending', pending);

  return <input type="submit" aria-disabled={pending} />;
}

export function LoginForm() {
  const [formState, action] = useFormState(login, {
    values: {
      username: '',
      password: '',
    }
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    username: string;
    password: string;
  }>({
    resolver: zodResolver(schema),
    defaultValues: formState.values,
    defaultErrors: formState.errors,
    progressive: true,
  });

  console.log('errors', errors);

  return (
    <form action={action} onSubmit={handleSubmit(() => {})}>
      <label>Username</label>
      <input {...register('username')} placeholder="Username" />
      {errors.username && <p>{errors.username.message}</p>}
      <label>Password</label>
      <input {...register('password')} type="password" placeholder="Password" />
      {errors.password && <p>{errors.password.message}</p>}
      <SubmitButton />
      {errors.root?.serverError && <p>{errors.root.serverError.message}</p>}
    </form>
  );
}
