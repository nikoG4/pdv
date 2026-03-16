/* eslint-disable react/prop-types */
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ArrowLeftIcon } from '../ui/icons';
import PdfViewer from '../ui/PdfViewer';

const CashRegistersReport = ({ setReportState, reportState }) => {
  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          className="mr-4"
          onClick={() => setReportState({ visible: false, title: '', file: null })}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-semibold">{reportState.title}</h1>
      </div>

      <Card className="w-full max-w-[100%]">
        <CardContent>
          {reportState.file && <PdfViewer file={reportState.file} />}
        </CardContent>
      </Card>
    </div>
  );
};

export default CashRegistersReport;
