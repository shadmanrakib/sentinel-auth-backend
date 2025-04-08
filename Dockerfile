# Use the official Go image to build the image
FROM golang:1.24-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Download dependencies and copy into container
COPY go.mod ./
RUN go mod download
COPY . .

# Build the application
RUN GOOS=linux go build -o server .

# Use a slim image to run the application
FROM alpine:latest

# Install certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Set the working directory
WORKDIR /root/

# Copy the pre-built binary from the building stage
COPY --from=builder /app/server .

# Expose the port the app runs on
EXPOSE 8080

# Command to run the executable
CMD ["./server"]