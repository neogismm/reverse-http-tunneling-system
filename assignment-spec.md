# Reverse HTTP Tunneling System

## (Using NestJS Will Earn Bonus Points)

## Project Overview

Build a **reverse HTTP tunneling system** that forwards incoming HTTP requests from a public-facing endpoint to a locally running service on a client machine.

For this assignment, the entire system will run **locally**. The goal is to demonstrate understanding of networking, request forwarding, and client–server communication.

---

## Problem Statement

You are required to design and implement a system consisting of:

1. A **Tunnel Server**
2. A **Client Agent** running on macOS
3. A **Local HTTP Application** exposed through the tunnel

The tunnel server should accept incoming HTTP requests on a specified port and forward them to the client agent, which then proxies the request to a local application running on another port. The response must be routed back to the original requester.

---

## Functional Requirements

### 1. Tunnel Server

- Runs locally
- Listens on a configurable HTTP port (e.g., `localhost:8080`)
- Accepts incoming HTTP requests
- Maintains a persistent connection with one or more client agents
- Forwards incoming requests to the appropriate client
- Relays the response back to the original HTTP caller

---

### 2. Client Agent

- Runs on macOS
- Establishes an outbound connection to the tunnel server
- Registers a local port to expose (e.g., `localhost:3000`)
- Receives forwarded HTTP requests from the tunnel server
- Proxies requests to the local application
- Sends the response back to the tunnel server

---

### 3. Local Application

- Any simple HTTP service (e.g., REST endpoint)
- Runs on a configurable local port
- Is not directly exposed to incoming requests except through the tunnel

---

## Request Flow

1. An HTTP request is sent to the tunnel server (e.g., `localhost:8080`)
2. The tunnel server forwards the request to the connected client agent
3. The client agent proxies the request to the local application
4. The local application responds
5. The response is sent back through the client agent to the tunnel server
6. The tunnel server returns the response to the original requester

---

## Constraints

- The solution must work **entirely locally**
- No third-party tunneling services may be used
- Any programming language or framework may be used
- The tunnel must support at least **basic HTTP methods** (`GET`, `POST`)
- Headers and request body must be preserved
- The system must handle at least one active client

---

## Non-Functional Requirements

- Clear project structure
- Readable, maintainable code
- Proper error handling
- Minimal external dependencies
- Documentation on how to run the system

---

## Deliverables

- Source code for:
    - Tunnel server
    - Client agent
- Instructions to:
    - Start the tunnel server
    - Start the client agent
    - Run the local application
    - Test request forwarding
- A short explanation of design decisions

---

## Evaluation Criteria

- Correctness of request forwarding
- Clarity of implementation
- Code quality and organization
- Understanding of networking concepts
- Reliability and edge case handling

---

## Bonus Points

- Supporting multiple clients
- Dynamic port assignment
- Authentication between client and server
- Logging and observability
- Support for non-HTTP TCP traffic
- **Implementing the tunnel server or client agent using NestJS (double bonus points)**

---

## Timeline & Delivery

This assignment is expected to take 24 **hours**.

---

## Notes

This project is intentionally open-ended. You are encouraged to make reasonable design decisions and clearly document any assumptions.