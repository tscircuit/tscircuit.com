import React, { useReducer, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAxios } from "@/hooks/use-axios"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { Loader2 } from "lucide-react"
import {  getNames } from "country-list"
import states from "states-us"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SearchableSelect } from "@/components/ui/searchable-select"

const USA = "United States of America"

type ShippingInfo = {
  firstName: string
  lastName: string
  companyName: string
  address: string
  apartment: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
}

type Action =
  | { type: "SET_FIELD"; field: keyof ShippingInfo; value: string }
  | { type: "SET_ALL"; payload: ShippingInfo }

const initialState: ShippingInfo = {
  firstName: "",
  lastName: "",
  companyName: "",
  address: "",
  apartment: "",
  zipCode: "",
  country: USA,
  city: "",
  state: "",
  phone: "",
}

const shippingPlaceholders: ShippingInfo = {
  firstName: "Enter your first name",
  lastName: "Enter your last name",
  companyName: "Enter company name (optional)",
  address: "Enter your street address",
  apartment: "Apartment, suite, unit etc. (optional)",
  zipCode: "Enter your zip code",
  country: "Select your country",
  city: "Enter your city",
  state: "Enter your state",
  phone: "Enter your phone number",
}

const ShippingInformationForm: React.FC = () => {
  const [form, setField] = useReducer(
    (state: ShippingInfo, action: Action): ShippingInfo => {
      switch (action.type) {
        case "SET_FIELD":
          return { ...state, [action.field]: action.value }
        case "SET_ALL":
          return action.payload
        default:
          return state
      }
    },
    initialState,
  )
  const { toast } = useToast()
  const axios = useAxios()
  const queryClient = useQueryClient()
  const [countries] = useState(getNames())
  const [isPhoneValid, setIsPhoneValid] = useState(true)

  const { data: account, isLoading: isLoadingAccount } = useQuery(
    "account",
    async () => {
      const response = await axios.get("/accounts/get")
      return response.data.account
    },
  )

  const updateShippingMutation = useMutation(
    (shippingInfo: ShippingInfo) =>
      axios.post("/accounts/update", { shippingInfo }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("account")
        toast({
          title: "Success",
          description: "Shipping information updated successfully",
        })
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update shipping information",
          variant: "destructive",
        })
      },
    },
  )

  useEffect(() => {
    if (account?.shippingInfo) {
      setField({
        type: "SET_ALL",
        payload: {
          ...account.shippingInfo,
          country: account.shippingInfo.country || USA,
        },
      })
    }
  }, [account])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    updateShippingMutation.mutate(form)
  }

  if (isLoadingAccount) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="country"
          className="block text-sm font-medium text-gray-700"
        >
          Country <span className="text-red-500">*</span>
        </label>
        <SearchableSelect
          options={countries.map(country => ({ value: country, label: country }))}
          value={form.country}
          onChange={(value) =>
            setField({ type: "SET_FIELD", field: "country", value })
          }
          resourceType="country"
        />
        {form.country !== USA && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>
              Currently, only shipping to the US is supported.{" "}
              <a
                href={`https://github.com/tscircuit/snippets/issues/new?title=${encodeURIComponent("Shipping to " + form.country)}&body=${encodeURIComponent("Please add support for shipping to " + form.country + ".")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline"
              >
                Create an Issue
              </a>
            </AlertDescription>
          </Alert>
        )}
      </div>
      <div>
        <label
          htmlFor="companyName"
          className="block text-sm font-medium text-gray-700"
        >
          Company Name
        </label>
        <Input
          id="companyName"
          value={form.companyName}
          onChange={(e) =>
            setField({
              type: "SET_FIELD",
              field: "companyName",
              value: e.target.value,
            })
          }
          placeholder={shippingPlaceholders.companyName}
          disabled={updateShippingMutation.isLoading}
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={(e) =>
              setField({
                type: "SET_FIELD",
                field: "firstName",
                value: e.target.value,
              })
            }
            placeholder={shippingPlaceholders.firstName}
            disabled={updateShippingMutation.isLoading}
            required
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="lastName"
            value={form.lastName}
            onChange={(e) =>
              setField({
                type: "SET_FIELD",
                field: "lastName",
                value: e.target.value,
              })
            }
            placeholder={shippingPlaceholders.lastName}
            disabled={updateShippingMutation.isLoading}
            required
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700"
        >
          Address <span className="text-red-500">*</span>
        </label>
        <Input
          id="address"
          value={form.address}
          onChange={(e) =>
            setField({
              type: "SET_FIELD",
              field: "address",
              value: e.target.value,
            })
          }
          placeholder={shippingPlaceholders.address}
          disabled={updateShippingMutation.isLoading}
          required
        />
      </div>
      <div>
        <label
          htmlFor="apartment"
          className="block text-sm font-medium text-gray-700"
        >
          Apartment, suite, unit etc.
        </label>
        <Input
          id="apartment"
          value={form.apartment}
          onChange={(e) =>
            setField({
              type: "SET_FIELD",
              field: "apartment",
              value: e.target.value,
            })
          }
          placeholder={shippingPlaceholders.apartment}
          disabled={updateShippingMutation.isLoading}
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700"
          >
            Town / City <span className="text-red-500">*</span>
          </label>
          <Input
            id="city"
            value={form.city}
            onChange={(e) =>
              setField({
                type: "SET_FIELD",
                field: "city",
                value: e.target.value,
              })
            }
            placeholder={shippingPlaceholders.city}
            disabled={updateShippingMutation.isLoading}
            required
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="state"
            className="block text-sm font-medium text-gray-700"
          >
            State{" "}
            {form.country === USA && <span className="text-red-500">*</span>}
          </label>
          {form.country === USA ? (
            <SearchableSelect
              options={states.map((state) => ({ value: state.name, label: state.name }))}
              value={form.state}
              onChange={(value) =>
                setField({ type: "SET_FIELD", field: "state", value })
              }
              resourceType="state"
            />
          ) : (
            <Input
              id="state"
              value={form.state}
              onChange={(e) =>
                setField({
                  type: "SET_FIELD",
                  field: "state",
                  value: e.target.value,
                })
              }
              placeholder={shippingPlaceholders.state}
              disabled={updateShippingMutation.isLoading}
            />
          )}
        </div>
      </div>
      <div>
        <label
          htmlFor="zipCode"
          className="block text-sm font-medium text-gray-700"
        >
          Postcode / Zip <span className="text-red-500">*</span>
        </label>
        <Input
          id="zipCode"
          value={form.zipCode}
          onChange={(e) =>
            setField({
              type: "SET_FIELD",
              field: "zipCode",
              value: e.target.value,
            })
          }
          placeholder={shippingPlaceholders.zipCode}
          disabled={updateShippingMutation.isLoading}
          required
        />
      </div>
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700"
        >
          Phone <span className="text-red-500">*</span>
        </label>
        <div>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => {
              setIsPhoneValid(true)
              setField({
                type: "SET_FIELD",
                field: "phone",
                value: e.target.value,
              })
            }}
            onBlur={() => {
              const phoneRegex =
                /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
              setIsPhoneValid(phoneRegex.test(form.phone))
            }}
            placeholder={shippingPlaceholders.phone}
            disabled={updateShippingMutation.isLoading}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: (123) 456-7890 or +1 123-456-7890
          </p>
          {!isPhoneValid && form.phone && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>
                Please enter a valid phone number.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      <Button
        type="submit"
        disabled={
          updateShippingMutation.isLoading ||
          form.country !== USA ||
          !isPhoneValid
        }
        onClick={handleSubmit}
      >
        {updateShippingMutation.isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Update"
        )}
      </Button>
    </div>
  )
}

export default ShippingInformationForm
