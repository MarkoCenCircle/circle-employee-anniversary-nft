import {useCallback, useEffect, useState} from "react";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, Label } from '@headlessui/react'
import debounce from "lodash.debounce";
import capitalize from "lodash.capitalize";
import {useRouter} from "next/router";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMagnifyingGlass, faSpinner} from "@fortawesome/free-solid-svg-icons";

type Person = { name: string; userId:number; email: string}

export const SearchForm = () => {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)
  const [users, setUsers] = useState<Person[]>([])
  const [selectedUser, setSelectedUser] = useState<Person | null | undefined>()

  const setQueryDebounce = useCallback(debounce(async (val: string) => {
    setLoading(true)

    try {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");

      const res = await fetch(`/api/users?email=${val}`, {
        method: 'GET',
        headers,
      })

      const data = await res.json() as Person[]

      setUsers(data)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }

  }, 1000), [])

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQueryDebounce.cancel()
    void setQueryDebounce(event.target.value)
  }

  const onSelect = (person: Person) => {
    setSelectedUser(person)
    if (person) {
      void router.push(`/users/${person.userId}`)
    }
  }

  useEffect(() => {
    return () => {
      setQueryDebounce.cancel()
    }
  }, [setQueryDebounce])

  return <div className="flex min-h-full flex-1 flex-col justify-center w-full">
    <div className="w-full">
      <Combobox
        as="div"
        value={selectedUser}
        onChange={onSelect}
      >
        <div className="relative mt-2">
          <ComboboxInput
            placeholder='Search by Circle email'
            className="block w-full rounded-md border-0 bg-white/5 p-1.5 pl-8 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-xl sm:leading-6"
            onChange={onSearchChange}
            displayValue={(person: Person) => person ? `${person.name}` : ''}
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-1">
            <FontAwesomeIcon icon={loading ? faSpinner : faMagnifyingGlass} className={loading ? 'fa-spin opacity-50' : 'opacity-50'} width={25} height={25}/>
          </div>

          {users.length > 0 && (
            <ComboboxOptions
              className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {users.map((person) => (
                <ComboboxOption
                  key={person.userId}
                  value={person}
                  className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
                >
                  <div className="flex">
                    <span
                      className="block truncate group-data-[selected]:font-semibold">{person.name}</span>
                    <span
                      className="ml-2 truncate text-gray-500 group-data-[focus]:text-indigo-200">
                      {person.email}
                    </span>
                  </div>

                </ComboboxOption>
              ))}
            </ComboboxOptions>
          )}
        </div>
      </Combobox>
    </div>
  </div>
}
