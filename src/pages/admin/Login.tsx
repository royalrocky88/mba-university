import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Field } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/context/AuthProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/**
 * Admin sign-in.
 *
 * There is deliberately no sign-up link: accounts are created in the Supabase
 * dashboard, because anyone who could self-register could edit the site.
 */
export function AdminLogin() {
  const { signIn, sendPasswordReset, configured } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useDocumentTitle('Admin sign in')

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)

    const result = await signIn(email, password)
    if (!result.ok) setError(result.error ?? 'Could not sign in')
    setBusy(false)
  }

  async function onReset() {
    if (!email) {
      setError('Enter your email address first, then choose "Forgot password".')
      return
    }
    setBusy(true)
    setError(null)
    const result = await sendPasswordReset(email)
    setBusy(false)
    if (result.ok) setNotice(`Password reset link sent to ${email}.`)
    else setError(result.error ?? 'Could not send the reset email')
  }

  return (
    <div className="grid min-h-svh place-items-center bg-ink-950 px-5 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5 text-ivory/50 transition-colors hover:text-gold-300">
          <Icon name="chevron-left" size={15} />
          <span className="text-[0.85rem]">Back to the public site</span>
        </Link>

        <div className="rounded-3xl border border-ivory/10 bg-ivory/[0.04] p-8 backdrop-blur">
          <span className="grid size-12 place-items-center rounded-xl bg-gold-500 text-ink-950">
            <Icon name="cpu" size={22} />
          </span>

          <h1 className="mt-5 font-display text-2xl text-ivory">Administrator sign in</h1>
          <p className="mt-2 text-[0.9rem] leading-relaxed text-ivory/55">
            Manage programmes, faculty, news, placements and every other page of the site.
          </p>

          {!configured && (
            <div className="mt-6 rounded-xl border border-gold-500/30 bg-gold-500/10 px-4 py-3.5 text-[0.84rem] leading-relaxed text-gold-200">
              <strong className="font-semibold">Supabase is not configured yet.</strong> Copy{' '}
              <code className="rounded bg-ink-950/50 px-1.5 py-0.5 text-[0.8rem]">.env.example</code> to{' '}
              <code className="rounded bg-ink-950/50 px-1.5 py-0.5 text-[0.8rem]">.env.local</code>, add
              your project URL and anon key, then restart the dev server. See README.md for the full
              five-minute setup.
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <div className="[&_label]:text-ivory/70 [&_input]:border-ivory/15 [&_input]:bg-ink-950/40 [&_input]:text-ivory [&_input]:placeholder:text-ivory/25">
              <Field
                label="Email address"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@meridian.edu.in"
              />
            </div>

            <div className="[&_label]:text-ivory/70 [&_input]:border-ivory/15 [&_input]:bg-ink-950/40 [&_input]:text-ivory [&_input]:placeholder:text-ivory/25">
              <Field
                label="Password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[0.84rem] text-red-300">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[0.84rem] text-emerald-300">
                {notice}
              </p>
            )}

            <Button type="submit" variant="gold" size="lg" className="w-full" disabled={busy || !configured}>
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>

            <button
              type="button"
              onClick={() => void onReset()}
              disabled={busy || !configured}
              className="w-full text-center text-[0.8rem] text-ivory/45 transition-colors hover:text-gold-300 disabled:opacity-40"
            >
              Forgot password?
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[0.78rem] leading-relaxed text-ivory/35">
          Accounts are created in the Supabase dashboard under Authentication → Users. There is no
          public sign-up.
        </p>
      </div>
    </div>
  )
}
