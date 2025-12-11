import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addPdfPayment } from '@/state/events/newPaymentSlice'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'

export default function FormSubmitPayment() {
  const { pricing, paymentPDF } = useSelector((state) => state.newPayment)
  const [paymentPDFFile, setPaymentPDFFile] = useState(paymentPDF)

  const dispatch = useDispatch()

  function changePayment(e) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPaymentPDFFile(file)
      dispatch(addPdfPayment(file))
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">
        Carga de Comprobante de Pago
      </h2>
      <PDFOption
        title={'Subir comprobante'}
        changeFile={changePayment}
        pdf={paymentPDFFile}
      />
    </div>
  )
}

function PDFOption({ changeFile, pdf, title }) {
  return (
    <div>
      <Label htmlFor="file-upload">{title}</Label>
      <div className="mt-1 flex items-center">
        <label
          htmlFor="file-upload"
          className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Upload className="h-4 w-4 inline-block mr-2" />
          Elegir archivo
        </label>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          onChange={changeFile}
        />
        <span className="ml-3 text-sm text-gray-500">
          {pdf ? pdf.name : 'Ningún archivo seleccionado'}
        </span>
      </div>
    </div>
  )
}

