import React, { useReducer, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAxios } from "@/hooks/use-axios"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { Loader2 } from "lucide-react"
import { sentenceCase } from "change-case"
import { getName, getNames } from "country-list"
import states from "states-us"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

type ShippingInfo = {
  fullName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

type Action =
  | { type: "SET_FIELD"; field: keyof ShippingInfo; value: string }
  | { type: "SET_ALL"; payload: ShippingInfo }

const initialState: ShippingInfo = {
  fullName: "",
  address: "",
  zipCode: "",
  country: "United States of America",
  city: "",
  state: "",
}

const shippingPlaceholders: ShippingInfo = {
  fullName: "Enter your full name",
  address: "Enter your street address",
  zipCode: "Enter your zip code",
  country: "Select your country",
  city: "Enter your city",
  state: "Enter your state",
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
          country: account.shippingInfo.country || "United States of America",
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-700"
        >
          Full Name
        </label>
        <Input
          id="fullName"
          value={form.fullName}
          onChange={(e) =>
            setField({
              type: "SET_FIELD",
              field: "fullName",
              value: e.target.value,
            })
          }
          placeholder={shippingPlaceholders.fullName}
          disabled={updateShippingMutation.isLoading}
        />
      </div>
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700"
        >
          Address
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
        />
      </div>
      <div>
        <label
          htmlFor="zipCode"
          className="block text-sm font-medium text-gray-700"
        >
          Zip Code
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
        />
      </div>
      <div>
        <label
          htmlFor="country"
          className="block text-sm font-medium text-gray-700"
        >
          Country
        </label>
        <Select
          value={form.country}
          onValueChange={(value) =>
            setField({ type: "SET_FIELD", field: "country", value })
          }
          disabled={updateShippingMutation.isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={shippingPlaceholders.country} />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.country !== "United States of America" && (
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
          htmlFor="city"
          className="block text-sm font-medium text-gray-700"
        >
          City
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
        />
      </div>
      <div>
        <label
          htmlFor="state"
          className="block text-sm font-medium text-gray-700"
        >
          State
        </label>
        {form.country === "United States of America" ? (
          <Select
            value={form.state}
            onValueChange={(value) =>
              setField({ type: "SET_FIELD", field: "state", value })
            }
            disabled={updateShippingMutation.isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={shippingPlaceholders.state} />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state.abbreviation} value={state.abbreviation}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      <Button
        type="submit"
        disabled={
          updateShippingMutation.isLoading ||
          form.country !== "United States of America"
        }
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
    </form>
  )
}

export default ShippingInformationForm
