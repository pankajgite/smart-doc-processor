package com.ai.invoice.dto;

import lombok.Data;

@Data
public class InvoiceDTO {

    private String invoiceNumber;
    private String vendorName;
    private String gstNumber;
    private Double totalAmount;
    private Double gstAmount;
    private String invoiceDate;
}
