start:
	@docker-compose up -d
	@docker-compose logs -f node

prisma_migrate: 
	@docker-compose run --rm node npx prisma migrate dev

prisma_reset: 
	@docker-compose run --rm node npx prisma migrate reset

prisma_db_push: 
	@docker-compose run --rm node npx prisma db push