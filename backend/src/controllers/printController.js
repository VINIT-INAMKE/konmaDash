import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer';

export const printReceipt = async (req, res) => {
  try {
    const { saleData, businessInfo } = req.body;

    // Initialize printer for Seznik F2 Pro Mini (58mm thermal printer, 48mm print width)
    // Try different interface options for Linux
    let printer;
    let printerOptions = [
      '/dev/usb/lp0',  // Common USB printer device on Linux
      '/dev/usb/lp1',
      'printer:Seznik',  // Try printer name
      'tcp://localhost'  // Network printer fallback
    ];

    // Try to find working printer interface
    for (const iface of printerOptions) {
      try {
        printer = new ThermalPrinter({
          type: PrinterTypes.EPSON,  // Seznik uses ESC/POS (EPSON compatible)
          interface: iface,
          characterSet: 'PC437_USA',
          removeSpecialCharacters: false,
          lineCharacter: "-",
          options: {
            timeout: 5000
          }
        });

        const isConnected = await printer.isPrinterConnected();
        if (isConnected) {
          console.log(`Printer connected via: ${iface}`);
          break;
        }
      } catch (err) {
        // Try next option
        continue;
      }
    }

    if (!printer) {
      return res.status(500).json({
        success: false,
        error: 'Could not find printer. Available interfaces: /dev/usb/lp0, /dev/usb/lp1. Please check: 1) USB connection, 2) Printer is powered on, 3) Run "ls -la /dev/usb" to find your printer device'
      });
    }

    // Set defaults
    const business = {
      name: businessInfo?.name || 'Konma Xperience Centre',
      address: businessInfo?.address || 'Block 60, Villa 14, Bollineni Hillside, Nookampalayam, Phase 1, Perumbakkam, Chennai, Tamil Nadu 600131',
      phone: businessInfo?.phone || '7709262997',
      gst: businessInfo?.gst || ''
    };

    // Format date
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    };

    // Start printing
    printer.alignCenter();
    printer.bold(true);
    printer.println(business.name.toUpperCase());
    printer.bold(false);
    printer.setTextNormal();
    printer.println(business.address);
    if (business.phone) {
      printer.println(`Tel: ${business.phone}`);
    }
    if (business.gst) {
      printer.println(`GSTIN: ${business.gst}`);
    }

    printer.drawLine();

    printer.bold(true);
    printer.println('SALES RECEIPT');
    printer.bold(false);
    printer.setTextNormal();
    printer.println(formatDate(saleData.createdAt));

    // Customer info
    if (saleData.customerName || saleData.customerPhone) {
      printer.newLine();
      if (saleData.customerName) {
        printer.alignLeft();
        printer.println(`Customer: ${saleData.customerName}`);
      }
      if (saleData.customerPhone) {
        printer.println(`Phone: ${saleData.customerPhone}`);
      }
    }

    printer.drawLine();

    // Items header
    printer.alignLeft();
    printer.bold(true);
    printer.tableCustom([
      { text: "Item", align: "LEFT", width: 0.5 },
      { text: "Qty", align: "CENTER", width: 0.15 },
      { text: "Amount", align: "RIGHT", width: 0.35 }
    ]);
    printer.bold(false);
    printer.drawLine();

    // Item details
    printer.tableCustom([
      { text: saleData.skuName, align: "LEFT", width: 0.5 },
      { text: saleData.quantity.toString(), align: "CENTER", width: 0.15 },
      { text: `₹${saleData.totalAmount.toFixed(2)}`, align: "RIGHT", width: 0.35, bold: true }
    ]);

    printer.drawLine();

    // Total
    printer.newLine();
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.tableCustom([
      { text: "TOTAL:", align: "LEFT", width: 0.5 },
      { text: `₹${saleData.totalAmount.toFixed(2)}`, align: "RIGHT", width: 0.5 }
    ]);
    printer.setTextNormal();
    printer.bold(false);

    if (saleData.paymentMethod) {
      printer.tableCustom([
        { text: "Payment:", align: "LEFT", width: 0.5 },
        { text: saleData.paymentMethod.toUpperCase(), align: "RIGHT", width: 0.5 }
      ]);
    }

    printer.drawLine();

    // Footer
    printer.alignCenter();
    printer.println(`Served by: ${saleData.soldBy}`);
    printer.newLine();
    printer.println('Thank you for your purchase!');
    printer.bold(true);
    printer.println('Please visit again');
    printer.bold(false);

    printer.newLine();
    printer.newLine();
    printer.newLine();

    // Cut paper
    printer.cut();

    try {
      await printer.execute();
      res.json({ success: true, message: 'Receipt printed successfully' });
    } catch (error) {
      console.error('Print execution error:', error);
      res.status(500).json({
        success: false,
        error: `Print failed: ${error.message}`
      });
    }

  } catch (error) {
    console.error('Print controller error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to print receipt'
    });
  }
};
