package com.example.eduConnect.DTO;

public class FileDTO {
    private Long id;
    private String name;
    private String type;
    private String size;
    private String uploaded;
    private String status;
    private String course;
  
    
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public String getUploaded() { return uploaded; }
    public void setUploaded(String uploaded) { this.uploaded = uploaded; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }
 
}