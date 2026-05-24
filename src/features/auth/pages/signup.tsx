import { SignupForm } from '@/features/auth/components/signup-form';

export default function Signup() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-muted/50">
      <div className="w-full max-w-4xl">
        <SignupForm />
      </div>
    </div>
  )
}
