import { Calendar, ChevronDown, ChevronRight, Shield } from 'lucide-react'
import PriceDialog from './PriceDialog'
import { INSCRIPTION_ROLES_LABELS } from '@/lib/Constants.js'
import { getDateByName } from '@/lib/utils.js'
import MakeEventFreeButton from './MakeEventFreeButton'
import ConfirmDeletePriceDialog from './ConfirmDeletePriceDialog'

export default function PricesTable({
  prices,
  dates,
  expandedPrices,
  onToggleExpand,
  onUpdatePrice,
  onDeletePrice,
  onMakeEventFree,
  isLoading,
}) {
  if (prices.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2">Ninguna tarifa cargada</h2>
        <p className="text-gray-500 mb-4">
          Agregar una nueva para visualizarla. Debe configurar al menos una
          tarifa para publicar el evento.
        </p>
        <div className="flex flex-col items-center space-y-4">
          <PriceDialog onSave={onUpdatePrice} isLoading={isLoading} />
          <MakeEventFreeButton
            onMakeEventFree={onMakeEventFree}
            isLoading={isLoading}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {prices.map((price) => (
        <PriceItem
          key={price.name}
          price={price}
          dates={dates}
          isExpanded={expandedPrices.has(price.name)}
          onToggleExpand={() => onToggleExpand(price.name)}
          onUpdatePrice={onUpdatePrice}
          onDeletePrice={onDeletePrice}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}

function PriceItem({
  price,
  dates,
  isExpanded,
  onToggleExpand,
  onUpdatePrice,
  onDeletePrice,
  isLoading,
}) {
  async function handleDelete(priceName) {
    await onDeletePrice(priceName)
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        className="flex items-center p-4 bg-white hover:bg-gray-50 cursor-pointer"
        onClick={onToggleExpand}
      >
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 mr-2 text-gray-500" />
        ) : (
          <ChevronRight className="h-5 w-5 mr-2 text-gray-500" />
        )}
        <span className="font-medium mr-2">{price.name}</span>
        <span className="text-sm text-gray-500 mr-2">{price.description}</span>
        <span className="font-semibold">
          {price.value === 0 ? 'Gratuita' : '$' + price.value}
        </span>
        {price.need_verification && (
          <Shield className="h-4 w-4 ml-2 text-blue-500" />
        )}
        {price.related_date && (
          <Calendar className="h-4 w-4 ml-2 text-green-500" />
        )}
      </div>
      {isExpanded && (
        <div className="p-4 bg-gray-50 flex justify-between items-center">
          <div className="space-y-2">
            <p>
              <strong>Roles:</strong>{' '}
              {price.roles.length > 0
                ? price.roles.map((r) => INSCRIPTION_ROLES_LABELS[r]).join(', ')
                : 'Sin roles especificados'}
            </p>
            <p>
              <strong>Requiere verificación:</strong>{' '}
              {price.need_verification ? 'Sí' : 'No'}
            </p>
            <p>
              <strong>Fecha límite:</strong>{' '}
              {getDateByName(dates, price.related_date)?.date ||
                'Sin fecha límite'}
            </p>
          </div>
          <div className="space-x-2">
            <PriceDialog
              price={price}
              dates={dates}
              onSave={onUpdatePrice}
              isLoading={isLoading}
            />
            <ConfirmDeletePriceDialog
              priceName={price.name}
              onConfirm={() => handleDelete(price.name)}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  )
}
