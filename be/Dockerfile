# syntax=docker/dockerfile:1.7
# Builder runs on native host arch (BUILDPLATFORM) → fast.
# Go cross-compiles to target arch via GOOS/GOARCH from buildx.
FROM --platform=$BUILDPLATFORM golang:1.23-alpine AS builder

ARG TARGETOS
ARG TARGETARCH

WORKDIR /app

RUN apk add --no-cache gcc musl-dev

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH \
    go build -ldflags="-s -w" -o main ./cmd/main.go

# Runtime image — target arch
FROM alpine:3.20

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata curl

COPY --from=builder /app/main .
COPY --from=builder /app/migrations ./migrations

RUN mkdir -p uploads/ipls uploads/finance uploads/qrcodes uploads/pengumuman

EXPOSE 8080

CMD ["./main"]
