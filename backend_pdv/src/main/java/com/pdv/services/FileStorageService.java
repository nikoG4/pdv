package com.pdv.services;


import org.springframework.stereotype.Service;

@Service
public class FileStorageService {

    // @Value("${file.upload-dir}")
    // private String uploadDir;

    // public String saveFile(MultipartFile file) throws IOException {
    //     File dir = new File(uploadDir);
    //     if (!dir.exists()) {
    //         dir.mkdirs();
    //     }
    //     String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
    //     File serverFile = new File(dir, fileName);
    //     file.transferTo(serverFile);
    //     return fileName;
    // }

    // public byte[] getFile(String fileName) throws IOException {
    //     return Files.readAllBytes(Paths.get(uploadDir + File.separator + fileName));
    // }
}
