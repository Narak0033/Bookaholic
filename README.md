# 📚 Bookaholic

A cloud-native social reading tracker. Track your books, discover new reads based on your taste in genres and tropes, connect with other readers, and get your personal reading Wrapped every year.

**Live:** [bookaholic.cloudrak.work](https://bookaholic.cloudrak.work) · **Developer:** [cloudrak.work](https://cloudrak.work)

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js · Express |
| Frontend | React |
| Database | MongoDB (self-hosted on Oracle Cloud) |
| Containerisation | Docker |
| Orchestration | Kubernetes (k3s) |
| CI/CD | GitHub Actions |
| Infrastructure as Code | Terraform |
| Monitoring | Prometheus · Grafana |
| Hosting | Oracle Cloud Free Tier |
| Frontend hosting | Cloudflare Pages |
| DNS · CDN | Cloudflare (cloudrak.work) |

---

## Services

| Service | Port | Responsibility |
|---|---|---|
| API Gateway | 4000 | JWT verification, request routing |
| Auth | 5001 | Login, register, user profiles |
| Books | 5002 | Google Books API, manual entry |
| Tracking | 5003 | Reading progress, logs, Wrapped |
| Reviews | 5004 | Ratings, reviews, comments |
| Social | 5005 | Follows, book clubs, discussions |
| Recommend | 5006 | Personalised book picks |
| Notify | 5007 | Alerts and reminders |

---

## Project structure
bookaholic/

├── .github/workflows/     # CI/CD pipelines per service

├── services/              # All microservices

│   ├── api-gateway/

│   ├── auth-service/

│   ├── books-service/

│   ├── tracking-service/

│   ├── reviews-service/

│   ├── social-service/

│   ├── recommend-service/

│   └── notify-service/

├── frontend/              # React app (Cloudflare Pages)

├── infrastructure/

│   ├── terraform/         # Oracle Cloud provisioning

│   └── k8s/               # Kubernetes manifests

├── monitoring/

│   ├── prometheus/

│   └── grafana/

└── docs/                  # Architecture and API docs

---

## Local development

> Setup guide coming as services are built.

---

## Deployment

> Deployed on Oracle Cloud Free Tier with k3s. CI/CD via GitHub Actions.
> Full deployment guide in `docs/deployment.md`.

---

## License

MIT
