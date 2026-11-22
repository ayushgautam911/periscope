/**
 * Registry of states that have data wired into the app.
 * Add an entry here when a new state's repository is ready.
 */
export interface StateEntry {
  id: string
  name: string
  /** Most recent election year available. */
  electionYear: number
  house: 'Vidhan Sabha' | 'Lok Sabha' | 'Both'
}

export const AVAILABLE_STATES: StateEntry[] = [
  { id: 'andhra-pradesh', name: 'Andhra Pradesh', electionYear: 2024, house: 'Vidhan Sabha' },
  { id: 'arunachal-pradesh', name: 'Arunachal Pradesh', electionYear: 2024, house: 'Vidhan Sabha' },
  { id: 'assam', name: 'Assam', electionYear: 2021, house: 'Vidhan Sabha' },
  { id: 'bihar', name: 'Bihar', electionYear: 2025, house: 'Vidhan Sabha' },
  { id: 'chhattisgarh', name: 'Chhattisgarh', electionYear: 2023, house: 'Vidhan Sabha' },
  { id: 'delhi', name: 'Delhi', electionYear: 2025, house: 'Vidhan Sabha' },
  { id: 'goa', name: 'Goa', electionYear: 2022, house: 'Both' },
  { id: 'gujarat', name: 'Gujarat', electionYear: 2022, house: 'Vidhan Sabha' },
  { id: 'haryana', name: 'Haryana', electionYear: 2024, house: 'Vidhan Sabha' },
  { id: 'himachal-pradesh', name: 'Himachal Pradesh', electionYear: 2022, house: 'Vidhan Sabha' },
  { id: 'jammu-kashmir', name: 'Jammu and Kashmir', electionYear: 2024, house: 'Vidhan Sabha' },
  { id: 'jharkhand', name: 'Jharkhand', electionYear: 2024, house: 'Vidhan Sabha' },
  { id: 'karnataka', name: 'Karnataka', electionYear: 2023, house: 'Vidhan Sabha' },
  { id: 'kerala', name: 'Kerala', electionYear: 2021, house: 'Vidhan Sabha' },
  { id: 'madhya-pradesh', name: 'Madhya Pradesh', electionYear: 2023, house: 'Vidhan Sabha' },
  { id: 'maharashtra', name: 'Maharashtra', electionYear: 2019, house: 'Vidhan Sabha' },
  { id: 'manipur', name: 'Manipur', electionYear: 2022, house: 'Vidhan Sabha' },
  { id: 'meghalaya', name: 'Meghalaya', electionYear: 2023, house: 'Vidhan Sabha' },
  { id: 'mizoram', name: 'Mizoram', electionYear: 2023, house: 'Vidhan Sabha' },
  { id: 'nagaland', name: 'Nagaland', electionYear: 2023, house: 'Vidhan Sabha' },
  { id: 'odisha', name: 'Odisha', electionYear: 2024, house: 'Vidhan Sabha' },
  { id: 'puducherry', name: 'Puducherry', electionYear: 2021, house: 'Vidhan Sabha' },
  { id: 'punjab', name: 'Punjab', electionYear: 2022, house: 'Vidhan Sabha' },
  { id: 'rajasthan', name: 'Rajasthan', electionYear: 2023, house: 'Vidhan Sabha' },
  { id: 'sikkim', name: 'Sikkim', electionYear: 2024, house: 'Vidhan Sabha' },
  { id: 'tamil-nadu', name: 'Tamil Nadu', electionYear: 2021, house: 'Vidhan Sabha' },
  { id: 'telangana', name: 'Telangana', electionYear: 2023, house: 'Vidhan Sabha' },
  { id: 'tripura', name: 'Tripura', electionYear: 2023, house: 'Vidhan Sabha' },
  { id: 'uttar-pradesh', name: 'Uttar Pradesh', electionYear: 2022, house: 'Vidhan Sabha' },
  { id: 'uttarakhand', name: 'Uttarakhand', electionYear: 2022, house: 'Vidhan Sabha' },
  { id: 'west-bengal', name: 'West Bengal', electionYear: 2021, house: 'Vidhan Sabha' },
]
