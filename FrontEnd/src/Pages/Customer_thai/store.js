// src/store.js (or src/Pages/Customer_thai/store.js)
import { create } from 'zustand';

export const useFeedbackStore = create((set) => ({
    historyFeedbacks: [],
    topStorages: [],
    topTransports: [],
    allStorages: [],
    allTransports: [],
    setHistoryFeedbacks: (feedbacks) => set({ historyFeedbacks: feedbacks }),
    setTopStorages: (storages) => set({ topStorages: storages }),
    setTopTransports: (transports) => set({ topTransports: transports }),
    setAllStorages: (storages) => set({ allStorages: storages }),
    setAllTransports: (transports) => set({ allTransports: transports }),
}));