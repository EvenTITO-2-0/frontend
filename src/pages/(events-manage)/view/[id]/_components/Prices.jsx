import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from '@formkit/tempo'
import TitlePage from '@/pages/(events-manage)/_components/titlePage'

export default function Prices({ prices, dates }) {
  const [validPrices, setValidPrices] = useState([])

  useEffect(() => {
    const filteredPrices = prices.filter((price) =>
      verifyDate(price.related_date)
    )
    setValidPrices(filteredPrices)
  }, [prices])

  function verifyDate(priceDate) {
    const d = dates.filter((date) => date.name === priceDate)[0]?.date
    if (d) {
      return new Date(d) > new Date()
    } else {
      return true
    }
  }

  function getDate(priceDate) {
    const d = dates.filter((date) => date.name === priceDate)[0]?.date
    if (d) {
      return new Date(d)
    }

    return null
  }

  return (
    <div>
      <TitlePage title="Tarifas del evento" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {validPrices.map((price, index) => (
          <Card key={index} className="flex flex-col border-dashed">
            <CardHeader>
              <CardTitle>{price.name}</CardTitle>
              <CardDescription>{price.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <div className="text-3xl font-bold mb-1">
                $ {price.value.toFixed(2)}
              </div>
              {price.related_date && (
                <Badge variant="secondary" className="self-start">
                  Válido hasta: {format(getDate(price.related_date), 'short')}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
