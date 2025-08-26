import { create } from 'zustand'

type CounterState = {
    newRecord: number
    refreshTransaction: () => void
}

const useCounterStore = create<CounterState>(set => ({
    newRecord: 0,
    refreshTransaction: () => set(state => ({ newRecord: state.newRecord + 1 }))
}))

export default useCounterStore
