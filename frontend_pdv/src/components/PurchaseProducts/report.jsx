import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { ArrowLeftIcon } from '../ui/icons'
import PdfViewer from '../ui/PdfViewer'
import PurchaseService from '../../services/PurchaseService'

const PurchaseProductsReport = ({setIsReportVisible}) => {
	const [file, setfile] = useState(null)

    const getReport = async (desde, hasta) => {
        try {
          const response = await PurchaseService.getReport(desde, hasta);
          setfile(response); // Asegúrate de que 'response' sea el Blob correcto
        } catch (error) {
          console.error('Error al obtener el reporte:', error);
        }
    };
      

    const handleSubmit = (event) => {
        event.preventDefault()
        const formData = new FormData(event.target)
        const desde = formData.get('from')
        const hasta = formData.get('to')
        getReport(desde, hasta)
    }

	return (
		<div className="grid gap-4 md:gap-8">
			<div className="flex items-center">
				<Button variant="outline" size="icon" className="mr-4" onClick={() => setIsReportVisible(false)} >
					<ArrowLeftIcon className="h-4 w-4" />
					<span className="sr-only">Back</span>
				</Button>
				<h1 className="text-2xl font-semibold">Reporte de Compras</h1>
			</div>

			<Card className="w-full max-w-[100%]">
				<CardContent>
					<form className="grid gap-6" onSubmit={handleSubmit} >
						<div className="grid sm:grid-cols-2 gap-2 p-2">
							<div className="grid gap-2">
								<Label htmlFor="from">Desde</Label>
								<Input
									id="from"
									name="from"
									type="date"
									defaultValue={new Date().toISOString().split('T')[0]}
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="to">Hasta</Label>
								<Input
									id="to"
									name="to"
									type="date"
									defaultValue={new Date().toISOString().split('T')[0]}
								/>
							</div>

							<div className="grid gap-2 w-full sm:w-auto sm:justify-end col-span-2">
								<Label ></Label>
                                <div className="flex justify-end space-x-2 w-full sm:w-auto sm:justify-start">
								    <Button type="submit" >Imprimir</Button>
                                </div>
							</div>
						</div>
                        {file && <PdfViewer file={file}  />}						
					</form>
				</CardContent>
			</Card>
		</div>
	)
}

export default PurchaseProductsReport
