package com.swiggy.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private String userName;
    private String userImage;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
