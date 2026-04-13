import { Fragment, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export default function Autocomplete({ 
  value, 
  onChange, 
  options, 
  optionLabel, 
  optionValue = 'id',
  placeholder = 'Seleccionar...',
  required = false,
  disabled = false
}) {
  const [query, setQuery] = useState('');

  const filteredOptions = query === ''
    ? options
    : options.filter((option) => {
        const label = typeof optionLabel === 'function' ? optionLabel(option) : option[optionLabel];
        return label.toLowerCase().includes(query.toLowerCase());
      });

  const getDisplayValue = () => {
    if (!value) return '';
    const selected = options.find(o => o[optionValue] === value || o[optionValue] === parseInt(value));
    if (!selected) return '';
    return typeof optionLabel === 'function' ? optionLabel(selected) : selected[optionLabel];
  };

  return (
    <Combobox 
      value={value} 
      onChange={onChange} 
      disabled={disabled}
    >
      <div className="relative">
        <Combobox.Input
          className="input"
          displayValue={() => getDisplayValue()}
          onMouseDown={(e) => {
            e.target.setSelectionRange(0, e.target.value.length);
          }}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
            {filteredOptions.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                No encontrado
              </div>
            ) : (
              filteredOptions.map((option) => (
                <Combobox.Option
                  key={option[optionValue]}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-primary-500 text-white' : 'text-gray-900 dark:text-gray-100'
                    }`
                  }
                  value={option[optionValue]}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {typeof optionLabel === 'function' ? optionLabel(option) : option[optionLabel]}
                      </span>
                      {selected && (
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                          active ? 'text-white' : 'text-primary-500'
                        }`}>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}