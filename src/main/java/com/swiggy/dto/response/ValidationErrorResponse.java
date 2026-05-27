package com.swiggy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class ValidationErrorResponse {
    private boolean success;
    private String message;
    private Map<String, String> errors;
    private List<String> globalErrors;
}
