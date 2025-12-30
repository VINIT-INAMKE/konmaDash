'use client';

import { forwardRef } from 'react';

interface ReceiptProps {
  saleData: {
    skuName: string;
    quantity: number;
    price: number;
    totalAmount: number;
    soldBy: string;
    customerName?: string;
    customerPhone?: string;
    paymentMethod?: string;
    createdAt: string;
  };
  businessInfo?: {
    name: string;
    address?: string;
    phone?: string;
    gst?: string;
  };
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  ({ saleData, businessInfo }, ref) => {
    const defaultBusinessInfo = {
      name: businessInfo?.name || 'Konma Xperience Centre',
      address: businessInfo?.address || 'Block 60, Villa 14, Bollineni Hillside, Nookampalayam, Phase 1, Perumbakkam, Chennai, Tamil Nadu 600131',
      phone: businessInfo?.phone || '7709262997',
      gst: businessInfo?.gst || '',
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    };

    return (
      <div
        ref={ref}
        className="receipt-container bg-white text-black p-4 w-48 mx-auto relative overflow-hidden print:max-w-[48mm] print:m-0 print:p-[2mm]"
        style={{
          fontFamily: 'monospace',
          fontSize: '11px',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
          colorAdjust: 'exact',
          maxWidth: '48mm'
        }}
      >
        {/* Backdrop Image */}
        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: 'url(/backdrop.jpeg)',
            opacity: 0.2,
            zIndex: 0,
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
            colorAdjust: 'exact'
          }}
        />
        {/* Header */}
        <div className="text-center pb-2 mb-2 relative z-10">
          <h1 className="text-sm font-bold uppercase mb-1 break-words leading-tight">{defaultBusinessInfo.name}</h1>
          {defaultBusinessInfo.address && (
            <p className="text-[9px] mt-1 break-words leading-snug">{defaultBusinessInfo.address}</p>
          )}
          {defaultBusinessInfo.phone && (
            <p className="text-[9px] mt-1">Tel: {defaultBusinessInfo.phone}</p>
          )}
          {defaultBusinessInfo.gst && (
            <p className="text-[9px] mt-1">GSTIN: {defaultBusinessInfo.gst}</p>
          )}
        </div>
        <div className="text-center mb-2 relative z-10" style={{ letterSpacing: '0.1em', fontSize: '10px' }}>
          {'- - - - - - - - - - - - - -'}
        </div>

        {/* Receipt Title */}
        <div className="text-center mb-3 relative z-10">
          <h2 className="text-sm font-bold">SALES RECEIPT</h2>
          <p className="text-[9px] mt-1">{formatDate(saleData.createdAt)}</p>
        </div>

        {/* Customer Information */}
        {(saleData.customerName || saleData.customerPhone) && (
          <div className="mb-3 text-[10px] space-y-1 relative z-10">
            {saleData.customerName && (
              <p className="break-words">
                <span className="font-semibold">Customer:</span> {saleData.customerName}
              </p>
            )}
            {saleData.customerPhone && (
              <p className="break-words">
                <span className="font-semibold">Phone:</span> {saleData.customerPhone}
              </p>
            )}
          </div>
        )}

        {/* Items Table */}
        <div className="text-center mb-2 relative z-10" style={{ letterSpacing: '0.1em', fontSize: '10px' }}>
          {'- - - - - - - - - - - - - -'}
        </div>
        <div className="py-1 mb-2 overflow-hidden relative z-10">
          <table className="w-full text-[9px] table-fixed">
            <thead>
              <tr>
                <th className="text-left pb-1 w-[45%] font-semibold">Item</th>
                <th className="text-center pb-1 w-[15%] font-semibold">Qty</th>
                <th className="text-right pb-1 w-[40%] font-semibold">Amt</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3} className="py-0">
                  <div style={{ letterSpacing: '0.05em', fontSize: '9px' }}>
                    {'- - - - - - - - - - - - - -'}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="py-1 break-words w-[45%]">{saleData.skuName}</td>
                <td className="text-center w-[15%]">{saleData.quantity}</td>
                <td className="text-right w-[40%] font-semibold">₹{saleData.totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-center mb-2 relative z-10" style={{ letterSpacing: '0.1em', fontSize: '10px' }}>
          {'- - - - - - - - - - - - - -'}
        </div>

        {/* Total */}
        <div className="mb-3 space-y-2 relative z-10">
          <div className="flex justify-between text-sm font-bold">
            <span>TOTAL:</span>
            <span>₹{saleData.totalAmount.toFixed(2)}</span>
          </div>
          {saleData.paymentMethod && (
            <div className="flex justify-between text-[9px] mt-1">
              <span>Payment:</span>
              <span className="uppercase font-semibold">{saleData.paymentMethod}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mb-2 relative z-10" style={{ letterSpacing: '0.1em', fontSize: '10px' }}>
          {'- - - - - - - - - - - - - -'}
        </div>
        <div className="pt-2 mt-2 text-center text-[9px] space-y-1 relative z-10">
          <p className="break-words">Served by: {saleData.soldBy}</p>
          <p className="mt-2">Thank you for your purchase!</p>
          <p className="mt-1 font-semibold">Please visit again</p>
        </div>

      </div>
    );
  }
);

Receipt.displayName = 'Receipt';
