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
        className="receipt-container bg-white text-black p-8 w-80 mx-auto relative overflow-hidden"
        style={{ fontFamily: 'monospace' }}
      >
        {/* Backdrop Image */}
        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: 'url(/backdrop.jpeg)',
            opacity: 0.2,
            zIndex: 0,
          }}
        />
        {/* Header */}
        <div className="text-center border-b-2 border-dashed border-gray-400 pb-5 mb-5 relative z-10">
          <h1 className="text-xl font-bold uppercase mb-2 break-words">{defaultBusinessInfo.name}</h1>
          {defaultBusinessInfo.address && (
            <p className="text-xs mt-2 break-words leading-relaxed">{defaultBusinessInfo.address}</p>
          )}
          {defaultBusinessInfo.phone && (
            <p className="text-xs mt-1">Tel: {defaultBusinessInfo.phone}</p>
          )}
          {defaultBusinessInfo.gst && (
            <p className="text-xs mt-1">GSTIN: {defaultBusinessInfo.gst}</p>
          )}
        </div>

        {/* Receipt Title */}
        <div className="text-center mb-5 relative z-10">
          <h2 className="text-lg font-bold">SALES RECEIPT</h2>
          <p className="text-xs mt-2">{formatDate(saleData.createdAt)}</p>
        </div>

        {/* Customer Information */}
        {(saleData.customerName || saleData.customerPhone) && (
          <div className="mb-5 text-sm space-y-2 relative z-10">
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
        <div className="border-t-2 border-b-2 border-dashed border-gray-400 py-4 mb-5 overflow-hidden relative z-10">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left pb-3 w-[40%]">Item</th>
                <th className="text-center pb-3 w-[15%]">Qty</th>
                <th className="text-right pb-3 w-[22.5%]">Rate</th>
                <th className="text-right pb-3 w-[22.5%]">Amt</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 break-words w-[40%]">{saleData.skuName}</td>
                <td className="text-center w-[15%]">{saleData.quantity}</td>
                <td className="text-right w-[22.5%] text-xs">₹{saleData.price.toFixed(2)}</td>
                <td className="text-right w-[22.5%] font-semibold text-xs">₹{saleData.totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="mb-5 space-y-3 relative z-10">
          <div className="flex justify-between text-lg font-bold">
            <span>TOTAL:</span>
            <span>₹{saleData.totalAmount.toFixed(2)}</span>
          </div>
          {saleData.paymentMethod && (
            <div className="flex justify-between text-sm mt-3">
              <span>Payment Method:</span>
              <span className="uppercase font-semibold">{saleData.paymentMethod}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-dashed border-gray-400 pt-5 mt-5 text-center text-xs space-y-2 relative z-10">
          <p className="break-words">Served by: {saleData.soldBy}</p>
          <p className="mt-3">Thank you for your purchase!</p>
          <p className="mt-2 font-semibold">Please visit again</p>
        </div>

        {/* Print Styles */}
        <style jsx>{`
          @media print {
            .receipt-container {
              max-width: 80mm;
              margin: 0;
              padding: 10mm;
            }
          }
        `}</style>
      </div>
    );
  }
);

Receipt.displayName = 'Receipt';
