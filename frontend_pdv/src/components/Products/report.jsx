import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ArrowLeftIcon } from '../ui/icons';
import PdfViewer from '../ui/PdfViewer';

const ProductsReport = ({ setIsReportVisible, file }) => {
	
	return (
		<div className="grid gap-4 md:gap-8">
			<div className="flex items-center">
				<Button
					variant="outline"
					size="icon"
					className="mr-4"
					onClick={() => setIsReportVisible(false)}
				>
					<ArrowLeftIcon className="h-4 w-4" />
					<span className="sr-only">Back</span>
				</Button>
				<h1 className="text-2xl font-semibold">Reporte de Ventas</h1>
			</div>

			<Card className="w-full max-w-[100%]">
				<CardContent>
					{file && <PdfViewer file={file} />}
				</CardContent>
			</Card>
		</div>
	);
};

export default ProductsReport;
