 DEPLOYED WEBSITE LINK:https://pixel-pair-zeta.vercel.app/

# PixelPair

### Offline Visual Product Comparison Engine

**One-line description:**
PixelPair is a fully offline, privacy-first AI-powered visual similarity engine that finds visually similar products directly on the user’s device.

---

# Problem Statement

## Problem Title

Cloud-Dependent Visual Search in E-Commerce

## Problem Description

Online shopping is driven by visual decision-making. Users often want to find products that *look similar* to an image they like — such as a screenshot, social media post, or competitor product.

However, most existing visual search solutions:

* Upload user images to cloud servers
* Depend on paid APIs
* Require internet connectivity
* Increase operational costs
* Raise privacy concerns

There is currently no lightweight, fully client-side visual comparison engine that works independently without cloud infrastructure.

---

## Target Users

* Online shoppers
* E-commerce platforms
* Retail stores & kiosks
* Fashion & lifestyle brands
* DOCTORS (DERMA.)

---

## Existing Gaps

* Heavy cloud dependency
* Privacy risks from image uploads
* High API and server costs
* No offline capability
* Slow response due to server latency

---

# Problem Understanding & Approach

## Root Cause Analysis

Visual search requires deep learning models to extract features from images. Traditionally, these models are hosted on servers because of computational requirements.

This leads to:

* Infrastructure dependency
* Increased latency
* Scalability challenges
* Privacy concerns

---

## Solution Strategy

PixelPair eliminates server dependency by:

* Running TensorFlow.js directly in the browser
* Extracting embeddings on-device
* Storing product embeddings locally
* Computing cosine similarity client-side
* Returning ranked results instantly

---

# Proposed Solution

## Solution Overview

PixelPair is a browser-based AI system that analyzes images locally and finds visually similar products from a stored catalog without making any API calls.

---

## Core Idea

Convert images into numerical embeddings using MobileNet and compare embeddings using cosine similarity to measure visual similarity.

---

## Key Features

* Drag-and-drop image upload
* On-device ML inference using TensorFlow.js
* Local embedding storage (IndexedDB)
* Cosine similarity ranking
* Similarity confidence scores
* Fully offline operation
*  No external APIs

---

#  System Architecture

## High-Level Flow

User → Frontend → TensorFlow.js Model → Embedding Generator → Local Database (IndexedDB) → Similarity Engine → Ranked Results

Since PixelPair is fully offline, backend processing is replaced with client-side logic.

---

## Architecture Description

1. User uploads an image.
2. Image is resized and normalized.
3. TensorFlow.js (MobileNet) extracts a feature embedding.
4. Stored product embeddings are retrieved from IndexedDB.
5. Cosine similarity is computed.
6. Top matches are ranked and displayed with confidence scores.

---

## Architecture Diagram
<img width="547" height="1987" alt="mermaid-diagram" src="https://github.com/user-attachments/assets/b214b238-30be-43ee-827c-13c0bd7771d2" />



# Database Design

## ER Diagram

<img width="420" height="1097" alt="mermaid-diagram (1)" src="https://github.com/user-attachments/assets/29d29e0c-dd03-4924-8fb7-71560e4d5135" />


## ER Diagram Description

### Entities

**Product**

* product_id
* name
* category
* image_path
* embedding_vector

Each product has one embedding representation stored locally.

Database: IndexedDB (Client-side storage)

---

# Dataset Selected

## Dataset Name

Custom Product Image Dataset

## Source

Curated sample e-commerce product images

## Data Type

Image data (JPEG/PNG)

## Selection Reason

* Lightweight
* Suitable for offline demo
* Controlled test environment
* Quick embedding generation

---

## Preprocessing Steps

* Resize image to 224x224
* Normalize pixel values
* Extract embedding using MobileNet
* Normalize embedding vector

---

# Model Selected

## Model Name

MobileNet (TensorFlow.js)

## Selection Reasoning

* Lightweight and fast
* Browser-optimized
* Pretrained on ImageNet
* Suitable for feature extraction

## Alternatives Considered

* ResNet (heavier model)
* EfficientNet (larger size)
* Custom CNN (time constraint)

---

## Evaluation Metrics

* Cosine similarity score
* Top-K ranking accuracy
* Inference latency
* Memory usage

---

#Technology Stack

## Frontend

* HTML/CSS
* Tailwind CSS

## Backend

Not required (fully client-side system)

## ML/AI

* TensorFlow.js
* MobileNet

## Database

* IndexedDB

## Deployment

* Static hosting (Vercel / Netlify / GitHub Pages)

---

# API Documentation & Testing

PixelPair operates without external APIs.

### Core Internal Functions

**generateEmbedding(image)**
Extracts embedding vector from image.

**cosineSimilarity(vectorA, vectorB)**
Computes similarity score.

**getTopMatches(queryEmbedding)**
Returns ranked similar products.

(Add console test screenshots here)

---

#Module-wise Development & Deliverables

## Checkpoint 1: Research & Planning

* Problem analysis
* Architecture design
* Stack finalization

## Checkpoint 2: Storage & Data Modeling

* IndexedDB schema
* Product catalog ingestion

## Checkpoint 3: Frontend Development

* Image upload UI
* Results grid UI
* Ranking component

## Checkpoint 4: Model Integration

* MobileNet loading
* Embedding extraction
* Preprocessing pipeline

## Checkpoint 5: Similarity Engine

* Cosine similarity implementation
* Ranking logic
* Confidence scoring

## Checkpoint 6: Deployment

* Final build
* Live hosting
* Demo preparation

---

# End-to-End Workflow

1. User uploads product image
2. Image is preprocessed
3. Embedding is generated
4. Stored embeddings are retrieved
5. Cosine similarity computed
6. Top 5 similar products displayed

---

#Demo & Video

Live Demo Link:
(Add link)

Demo Video Link:
(Add link)

GitHub Repository:
(Add link)

---

# Hackathon Deliverables Summary

* Fully offline working prototype
* On-device ML inference
* Local embedding storage
* Real-time similarity ranking
* Deployment-ready application

---

# Team Roles & Responsibilities

| Member Name   | Role                    | Responsibilities                     |
| ------------- | ----------------------- | ------------------------------------ |
| Tanishq Gupta | ML & System Architect   | Model integration, similarity engine |
|Kaustubh Kashyap| Frontend Developer     | UI/UX, result visualization ,Dataset 
                                               

---

# Future Scope & Scalability

## Short-Term

* Category-aware filtering
* Hybrid similarity (color + embedding)
* Larger catalog

## Long-Term

* Approximate Nearest Neighbor indexing
* Edge device optimization
* AR shopping integration
* Retail kiosk deployment

---

# Known Limitations

* Limited dataset size (demo scale)
* Performance depends on device capability
* No distributed catalog synchronization

---

# Impact

* Reduces server and API costs
* Protects user privacy
* Enables offline intelligent retail
* Improves product discovery experience
* Makes AI accessible on edge devices


