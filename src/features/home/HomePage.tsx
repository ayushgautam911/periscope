import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AVAILABLE_STATES } from '../../data/states'
import { lookupPincodeAnywhere } from '../../data/pincode'
import { candidateRepository } from '../../data'

interface PincodeOption {
  stateId: string
  constituencyId: string
  name: string
}

export default function HomePage() {
  const [stateSelected, setStateSelected] = useState('')
  const [pincode, setPincode] = useState('')
  const [pincodeError, setPincodeError] = useState('')
  const [pincodeBusy, setPincodeBusy] = useState(false)
  // Set when a pincode straddles constituencies: the voter picks theirs.
  const [pincodeOptions, setPincodeOptions] = useState<PincodeOption[]>([])
  const navigate = useNavigate()

  function handleStateGo() {
    if (stateSelected) navigate(`/state/${stateSelected}`)
  }

  async function handlePincodeGo() {
    const clean = pincode.trim()
    setPincodeOptions([])
    if (!/^\d{6}$/.test(clean)) {
      setPincodeError('Please enter a 6-digit pincode')
      return
    }
    setPincodeBusy(true)
    try {
      const result = await lookupPincodeAnywhere(clean)
      if (!result) {
        setPincodeError(
          'Pincode not found yet — please select your state below',
        )
        return
      }
      if (result.constituencyIds.length === 1) {
        navigate(`/compare/${result.stateId}/${result.constituencyIds[0]}`)
        return
      }
      // The pincode area spans more than one constituency — let them pick.
      const options = await Promise.all(
        result.constituencyIds.map(async (id) => {
          const c = await candidateRepository.getConstituency(
            result.stateId,
            id,
          )
          return { stateId: result.stateId, constituencyId: id, name: c?.name ?? id }
        }),
      )
      setPincodeOptions(options)
    } finally {
      setPincodeBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:py-16 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
        Periscope
      </h1>
      <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
        Know your leader before you choose them.
      </p>

      {/* Pincode path */}
      <div className="mt-12">
        <p className="text-sm font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500">
          Know your pincode?
        </p>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit pincode"
            value={pincode}
            onChange={(e) => { setPincode(e.target.value); setPincodeError('') }}
            onKeyDown={(e) => { if (e.key === 'Enter') handlePincodeGo() }}
            className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-600"
          />
          <button
            onClick={handlePincodeGo}
            disabled={!pincode || pincodeBusy}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-lg font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            {pincodeBusy ? '…' : 'Go'}
          </button>
        </div>
        {pincodeError && (
          <p className="mt-2 text-sm text-red-500 dark:text-red-400">{pincodeError}</p>
        )}
        {pincodeOptions.length > 0 && (
          <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 text-left dark:border-indigo-900 dark:bg-indigo-950/30">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              This pincode covers {pincodeOptions.length} constituencies — pick
              yours:
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {pincodeOptions.map((o) => (
                <button
                  key={o.constituencyId}
                  onClick={() =>
                    navigate(`/compare/${o.stateId}/${o.constituencyId}`)
                  }
                  className="w-full rounded-lg border border-indigo-300 bg-white px-4 py-2.5 text-left font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-700 dark:bg-gray-900 dark:text-indigo-300 dark:hover:bg-indigo-950"
                >
                  {o.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
        <span className="text-sm text-gray-400 dark:text-gray-600">or</span>
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* State dropdown path */}
      <div>
        <p className="text-sm font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500">
          Select your state
        </p>
        <div className="mt-3 flex flex-col gap-3">
          <select
            value={stateSelected}
            onChange={(e) => setStateSelected(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">Choose a state</option>
            {AVAILABLE_STATES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleStateGo}
            disabled={!stateSelected}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-lg font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            See constituencies
          </button>
        </div>
      </div>

    </div>
  )
}
