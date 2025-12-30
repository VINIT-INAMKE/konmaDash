import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer';
import { SerialPort } from 'serialport';

// ESC/POS Commands for thermal printers
const ESC = '\x1B';
const GS = '\x1D';

const COMMANDS = {
  INIT: ESC + '@',
  ALIGN_CENTER: ESC + 'a' + '\x01',
  ALIGN_LEFT: ESC + 'a' + '\x00',
  ALIGN_RIGHT: ESC + 'a' + '\x02',
  BOLD_ON: ESC + 'E' + '\x01',
  BOLD_OFF: ESC + 'E' + '\x00',
  CUT_PAPER: GS + 'V' + '\x00',  // Simpler cut command - partial cut
  LINE_FEED: '\x0A',
  NEWLINE: '\x0D\x0A'
};

// Raw ESC/POS printing function
const printRawEscPos = async (comPort, receiptText) => {
  return new Promise((resolve, reject) => {
    const port = new SerialPort({
      path: comPort,
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none'
    });

    port.on('open', () => {
      console.log(`Serial port ${comPort} opened successfully`);
      
      // Build ESC/POS command string
      let escPosData = COMMANDS.INIT; // Initialize printer
      escPosData += receiptText;
      escPosData += COMMANDS.CUT_PAPER; // Cut paper
      
      port.write(escPosData, (err) => {
        if (err) {
          console.error('Write error:', err);
          port.close();
          reject(err);
        } else {
          console.log('Data written to printer successfully');
          setTimeout(() => {
            port.close();
            resolve();
          }, 2000); // Give printer time to process
        }
      });
    });

    port.on('error', (err) => {
      console.error('Serial port error:', err);
      reject(err);
    });
  });
};

export const printCartReceipt = async (req, res) => {
  try {
    const { cartSaleData, businessInfo } = req.body;

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

    // Build receipt text (32 characters wide for 48mm thermal paper)
    // Layout: 48mm width = 32 characters with standard thermal printer font
    // Note: Thermal printers can't do background images with opacity like web pages
    // They only support monochrome bitmap logos. We can add decorative ASCII patterns instead
    let receiptText = '';
    
    // Top spacing
    receiptText += COMMANDS.NEWLINE + COMMANDS.NEWLINE + COMMANDS.NEWLINE;
    
    // Header
    receiptText += COMMANDS.ALIGN_CENTER + COMMANDS.BOLD_ON;
    receiptText += business.name.toUpperCase() + COMMANDS.NEWLINE;
    receiptText += COMMANDS.BOLD_OFF;
    receiptText += business.address + COMMANDS.NEWLINE;
    if (business.phone) {
      receiptText += `Tel: ${business.phone}` + COMMANDS.NEWLINE;
    }
    if (business.gst) {
      receiptText += `GSTIN: ${business.gst}` + COMMANDS.NEWLINE;
    }
    
    receiptText += '================================' + COMMANDS.NEWLINE;
    
    // Receipt title
    receiptText += COMMANDS.BOLD_ON + 'SALES RECEIPT' + COMMANDS.NEWLINE;
    receiptText += COMMANDS.BOLD_OFF + formatDate(cartSaleData.createdAt) + COMMANDS.NEWLINE;
    
    // Customer info
    if (cartSaleData.customerName || cartSaleData.customerPhone) {
      receiptText += COMMANDS.NEWLINE;
      if (cartSaleData.customerName) {
        receiptText += COMMANDS.ALIGN_LEFT + `Customer: ${cartSaleData.customerName}` + COMMANDS.NEWLINE;
      }
      if (cartSaleData.customerPhone) {
        receiptText += `Phone: ${cartSaleData.customerPhone}` + COMMANDS.NEWLINE;
      }
    }
    
    receiptText += '================================' + COMMANDS.NEWLINE;
    
    // Items header - optimized for 32 chars (Item=20, Qty=3, Amount=8)
    receiptText += COMMANDS.ALIGN_LEFT + COMMANDS.BOLD_ON;
    const headerItem = 'Item'.padEnd(16);
    const headerQty = 'Qty'.padStart(3);
    const headerAmount = 'Amount'.padStart(8);
    receiptText += `${headerItem} ${headerQty} ${headerAmount}` + COMMANDS.NEWLINE;
    receiptText += COMMANDS.BOLD_OFF;
    receiptText += '================================' + COMMANDS.NEWLINE;
    
    // Helper function to wrap text to specified width
    const wrapText = (text, width) => {
      if (text.length <= width) {
        return [text];
      }
      
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        if (testLine.length <= width) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Word is longer than width, force break it
            lines.push(word.substring(0, width));
            currentLine = word.substring(width);
          }
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      
      return lines;
    };

    // Process each item in the cart
    for (let index = 0; index < cartSaleData.items.length; index++) {
      const item = cartSaleData.items[index];
      const itemNumber = (index + 1).toString();
      const qty = item.quantity.toString();
      const amount = `Rs.${item.itemTotal.toFixed(2)}`;
      
      // Wrap item name to 13 characters (reduced to make room for item number)
      const wrappedItemLines = wrapText(item.skuName, 13);
      
      if (wrappedItemLines.length === 1) {
        // Single line - normal layout with item number
        const numberPart = itemNumber.padStart(2) + '.';
        const itemPart = wrappedItemLines[0].padEnd(13);
        const qtyPart = qty.padStart(3);
        const amountPart = amount.padStart(8);
        receiptText += `${numberPart} ${itemPart} ${qtyPart} ${amountPart}` + COMMANDS.NEWLINE;
      } else {
        // Multiple lines - show item number on first line, then continuation lines
        const numberPart = itemNumber.padStart(2) + '.';
        receiptText += `${numberPart} ${wrappedItemLines[0]}` + COMMANDS.NEWLINE;
        
        for (let i = 1; i < wrappedItemLines.length - 1; i++) {
          receiptText += `    ${wrappedItemLines[i]}` + COMMANDS.NEWLINE; // 4 spaces indent
        }
        // Last line with quantity and amount - ensure proper column alignment
        const lastLine = wrappedItemLines[wrappedItemLines.length - 1];
        const itemPart = lastLine.padEnd(13);
        const qtyPart = qty.padStart(3);  
        const amountPart = amount.padStart(8);
        receiptText += `    ${itemPart} ${qtyPart} ${amountPart}` + COMMANDS.NEWLINE;
      }
      
      // Add space between items (except after the last item)
      if (index < cartSaleData.items.length - 1) {
        receiptText += COMMANDS.NEWLINE;
      }
    }
    
    receiptText += '================================' + COMMANDS.NEWLINE;
    
    // Total - optimized for 32 chars
    receiptText += COMMANDS.NEWLINE + COMMANDS.BOLD_ON;
    const totalAmount = `Rs.${cartSaleData.totalAmount.toFixed(2)}`;
    receiptText += `TOTAL: ${totalAmount.padStart(25)}` + COMMANDS.NEWLINE;
    receiptText += COMMANDS.BOLD_OFF;
    
    if (cartSaleData.paymentMethod) {
      receiptText += `Payment: ${cartSaleData.paymentMethod.toUpperCase()}` + COMMANDS.NEWLINE;
    }
    
    if (cartSaleData.transactionId) {
      receiptText += `Transaction ID: ${cartSaleData.transactionId}` + COMMANDS.NEWLINE;
    }
    
    receiptText += '================================' + COMMANDS.NEWLINE;
    
    // Footer
    receiptText += COMMANDS.ALIGN_CENTER;
    receiptText += `Served by: ${cartSaleData.soldBy}` + COMMANDS.NEWLINE;
    receiptText += COMMANDS.NEWLINE + 'Thank you for your purchase!' + COMMANDS.NEWLINE;
    receiptText += COMMANDS.BOLD_ON + 'Please visit again' + COMMANDS.NEWLINE;
    receiptText += COMMANDS.BOLD_OFF;
    receiptText += COMMANDS.NEWLINE + COMMANDS.BOLD_ON + 'Happy New Year!!!' + COMMANDS.NEWLINE;
    receiptText += COMMANDS.BOLD_OFF;
    
    // Bottom spacing - increased after Happy New Year message
    receiptText += COMMANDS.NEWLINE + COMMANDS.NEWLINE + COMMANDS.NEWLINE + COMMANDS.NEWLINE + COMMANDS.NEWLINE;

    // Try raw ESC/POS printing first
    try {
      console.log('Attempting raw ESC/POS cart receipt printing via COM3...');
      await printRawEscPos('COM3', receiptText);
      console.log('Raw ESC/POS cart receipt printing successful!');
      res.json({ success: true, message: 'Cart receipt printed successfully via raw ESC/POS' });
      return;
    } catch (rawError) {
      console.log('Raw ESC/POS cart receipt printing failed:', rawError.message);
      res.status(500).json({
        success: false,
        error: `Cart receipt printing failed: ${rawError.message}`,
      });
    }
  } catch (error) {
    console.error('Cart print controller error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to print cart receipt'
    });
  }
};

export const printReceipt = async (req, res) => {
  try {
    const { saleData, businessInfo } = req.body;

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

    // Build receipt text (32 characters wide for 48mm thermal paper)
    // Layout: 48mm width = 32 characters with standard thermal printer font
    let receiptText = '';
    
    // Top spacing
    receiptText += COMMANDS.NEWLINE + COMMANDS.NEWLINE + COMMANDS.NEWLINE;
    
    // Header
    receiptText += COMMANDS.ALIGN_CENTER + COMMANDS.BOLD_ON;
    receiptText += business.name.toUpperCase() + COMMANDS.NEWLINE;
    receiptText += COMMANDS.BOLD_OFF;
    receiptText += business.address + COMMANDS.NEWLINE;
    if (business.phone) {
      receiptText += `Tel: ${business.phone}` + COMMANDS.NEWLINE;
    }
    if (business.gst) {
      receiptText += `GSTIN: ${business.gst}` + COMMANDS.NEWLINE;
    }
    
    receiptText += '================================' + COMMANDS.NEWLINE;
    
    // Receipt title
    receiptText += COMMANDS.BOLD_ON + 'SALES RECEIPT' + COMMANDS.NEWLINE;
    receiptText += COMMANDS.BOLD_OFF + formatDate(saleData.createdAt) + COMMANDS.NEWLINE;
    
    // Customer info
    if (saleData.customerName || saleData.customerPhone) {
      receiptText += COMMANDS.NEWLINE;
      if (saleData.customerName) {
        receiptText += COMMANDS.ALIGN_LEFT + `Customer: ${saleData.customerName}` + COMMANDS.NEWLINE;
      }
      if (saleData.customerPhone) {
        receiptText += `Phone: ${saleData.customerPhone}` + COMMANDS.NEWLINE;
      }
    }
    
    receiptText += '================================' + COMMANDS.NEWLINE;
    
    // Items header - optimized for 32 chars (Item=20, Qty=3, Amount=8)
    receiptText += COMMANDS.ALIGN_LEFT + COMMANDS.BOLD_ON;
    const headerItem = 'Item'.padEnd(20);
    const headerQty = 'Qty'.padStart(3);
    const headerAmount = 'Amount'.padStart(8);
    receiptText += `${headerItem} ${headerQty} ${headerAmount}` + COMMANDS.NEWLINE;
    receiptText += COMMANDS.BOLD_OFF;
    receiptText += '================================' + COMMANDS.NEWLINE;
    
    // Item details with text wrapping
    const qty = saleData.quantity.toString();
    const amount = `Rs.${saleData.totalAmount.toFixed(2)}`;
    
    // Helper function to wrap text to specified width
    const wrapText = (text, width) => {
      console.log(`Wrapping text: "${text}" to width: ${width}`);
      
      if (text.length <= width) {
        console.log('Text fits in one line');
        return [text];
      }
      
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        if (testLine.length <= width) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Word is longer than width, force break it
            lines.push(word.substring(0, width));
            currentLine = word.substring(width);
          }
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      
      console.log(`Wrapped into ${lines.length} lines:`, lines);
      return lines;
    };
    
    // Wrap item name to 20 characters (for first part of line)
    const wrappedItemLines = wrapText(saleData.skuName, 20);
    
    if (wrappedItemLines.length === 1) {
      // Single line - normal layout
      console.log('Single line layout');
      const itemPart = wrappedItemLines[0].padEnd(20);
      const qtyPart = qty.padStart(3);
      const amountPart = amount.padStart(8);
      receiptText += `${itemPart} ${qtyPart} ${amountPart}` + COMMANDS.NEWLINE;
    } else {
      // Multiple lines - show continuation lines first, then qty/amount on last line
      console.log('Multi-line layout');
      for (let i = 0; i < wrappedItemLines.length - 1; i++) {
        receiptText += `${wrappedItemLines[i]}` + COMMANDS.NEWLINE;
      }
      // Last line with quantity and amount - ensure proper column alignment
      const lastLine = wrappedItemLines[wrappedItemLines.length - 1];
      const itemPart = lastLine.padEnd(20);
      const qtyPart = qty.padStart(3);  
      const amountPart = amount.padStart(8);
      receiptText += `${itemPart} ${qtyPart} ${amountPart}` + COMMANDS.NEWLINE;
      console.log(`Final line: "${itemPart}|${qtyPart}|${amountPart}"`);
    }
    receiptText += '================================' + COMMANDS.NEWLINE;
    
    // Total - optimized for 32 chars
    receiptText += COMMANDS.NEWLINE + COMMANDS.BOLD_ON;
    const totalAmount = `Rs.${saleData.totalAmount.toFixed(2)}`;
    receiptText += `TOTAL: ${totalAmount.padStart(25)}` + COMMANDS.NEWLINE;
    receiptText += COMMANDS.BOLD_OFF;
    
    if (saleData.paymentMethod) {
      receiptText += `Payment: ${saleData.paymentMethod.toUpperCase()}` + COMMANDS.NEWLINE;
    }
    
    receiptText += '================================' + COMMANDS.NEWLINE;
    
    // Footer
    receiptText += COMMANDS.ALIGN_CENTER;
    receiptText += `Served by: ${saleData.soldBy}` + COMMANDS.NEWLINE;
    receiptText += COMMANDS.NEWLINE + 'Thank you for your purchase!' + COMMANDS.NEWLINE;
    receiptText += COMMANDS.BOLD_ON + 'Please visit again' + COMMANDS.NEWLINE;
    receiptText += COMMANDS.BOLD_OFF;
    receiptText += COMMANDS.NEWLINE + COMMANDS.BOLD_ON + 'Happy New Year!!!' + COMMANDS.NEWLINE;
    receiptText += COMMANDS.BOLD_OFF;
    
    // Bottom spacing - increased after Happy New Year message
    receiptText += COMMANDS.NEWLINE + COMMANDS.NEWLINE + COMMANDS.NEWLINE + COMMANDS.NEWLINE + COMMANDS.NEWLINE;

    // Try raw ESC/POS printing first
    try {
      console.log('Attempting raw ESC/POS printing via COM3...');
      await printRawEscPos('COM3', receiptText);
      console.log('Raw ESC/POS printing successful!');
      res.json({ success: true, message: 'Receipt printed successfully via raw ESC/POS' });
      return;
    } catch (rawError) {
      console.log('Raw ESC/POS printing failed:', rawError.message);
      // Fall back to thermal printer library
    }

    // Fallback to original thermal printer library method
    console.log('Falling back to thermal printer library...');
    
    let printer;
    let printerOptions = [];
    
    if (process.platform === 'win32') {
      printerOptions = [
        'printer:F2 Pro Printer',
        '//./COM3',
        'printer:Seznik F2 Pro Mini',
        'printer:Seznik',
        '//./COM4',
        '//./COM5'
      ];
    } else {
      printerOptions = [
        '/dev/usb/lp0',
        '/dev/usb/lp1',
        'printer:Seznik'
      ];
    }

    let lastError = null;
    for (const iface of printerOptions) {
      try {
        console.log(`Trying printer interface: ${iface}`);
        printer = new ThermalPrinter({
          type: PrinterTypes.EPSON,
          interface: iface,
          characterSet: 'PC437_USA',
          removeSpecialCharacters: false,
          lineCharacter: "-",
          options: {
            timeout: 10000,
            baudRate: 9600
          }
        });

        const isConnected = await printer.isPrinterConnected();
        if (isConnected) {
          console.log(`Printer connected successfully via: ${iface}`);
          break;
        } else {
          console.log(`Printer not connected via: ${iface}`);
          printer = null;
        }
      } catch (err) {
        console.log(`Error trying interface ${iface}:`, err.message);
        lastError = err;
        printer = null;
        continue;
      }
    }

    if (!printer) {
      let helpMsg = '';
      if (process.platform === 'win32') {
        helpMsg = 'Windows: Check Device Manager > Ports (COM & LPT) for COM port, or Printers & scanners for printer name. Ensure printer is installed and set as default.';
      } else {
        helpMsg = 'Linux: Run "ls -la /dev/usb" to find your printer device. Ensure user has permission to access printer.';
      }
      
      const errorMsg = lastError ? 
        `Both raw ESC/POS and thermal printer library failed. Last error: ${lastError.message}. Tried interfaces: ${printerOptions.join(', ')}. ${helpMsg}` :
        `Could not find printer using either method. Tried interfaces: ${printerOptions.join(', ')}. ${helpMsg}`;
      
      console.log('All printing methods failed:', errorMsg);
      return res.status(500).json({
        success: false,
        error: errorMsg
      });
    }

    // Use thermal printer library as fallback
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
    printer.alignLeft();
    printer.bold(true);
    printer.tableCustom([
      { text: "Item", align: "LEFT", width: 0.5 },
      { text: "Qty", align: "CENTER", width: 0.15 },
      { text: "Amount", align: "RIGHT", width: 0.35 }
    ]);
    printer.bold(false);
    printer.drawLine();

    printer.tableCustom([
      { text: saleData.skuName, align: "LEFT", width: 0.5 },
      { text: saleData.quantity.toString(), align: "CENTER", width: 0.15 },
      { text: `₹${saleData.totalAmount.toFixed(2)}`, align: "RIGHT", width: 0.35, bold: true }
    ]);

    printer.drawLine();
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

    try {
      printer.partialCut();
    } catch (cutError) {
      console.log('Partial cut failed, trying full cut:', cutError.message);
      try {
        printer.cut();
      } catch (fullCutError) {
        console.log('Full cut also failed, proceeding without cut:', fullCutError.message);
      }
    }

    try {
      console.log('Executing thermal printer library...');
      await printer.execute();
      console.log('Thermal printer library executed successfully');
      res.json({ success: true, message: 'Receipt printed successfully via thermal printer library' });
    } catch (error) {
      console.error('Thermal printer execution error:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      res.status(500).json({
        success: false,
        error: `Both printing methods failed. Raw ESC/POS: ${rawError?.message || 'failed'}. Thermal library: ${error.message}`,
        details: error.code || 'Unknown error code'
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