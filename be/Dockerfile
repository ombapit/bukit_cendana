FROM golang:1.23-alpine AS builder

WORKDIR /app

RUN apk add --no-cache gcc musl-dev

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/main.go

FROM alpine:3.20

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata curl

COPY --from=builder /app/main .
COPY --from=builder /app/.env .
COPY --from=builder /app/migrations ./migrations

RUN mkdir -p uploads/ipls uploads/finance

EXPOSE 8080

CMD ["./main"]
