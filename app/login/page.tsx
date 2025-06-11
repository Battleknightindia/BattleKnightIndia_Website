import { LoginForm } from './components/LoginForm'
import Image from 'next/image'

const LoginPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-black p-6 md:p-10">
          <div className="flex w-full max-w-sm flex-col gap-6">
            <a href="#" className="flex items-center gap-2 self-center font-medium">
              <div className="flex justify-center pt-18">
                <Image
                  src="/1.png"
                  alt="Battle Knight Logo"
                  width={160}
                  height={64}
                  className="h-12 md:h-16 w-auto"
                />
              </div>
            </a>
            <div className=""><LoginForm /></div>
          </div>
        </div>
  )
}

export default LoginPage