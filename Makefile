PID_FILE := frontend.pid

.PHONY: up
up:
	nohup npm run dev > frontend.log 2>&1 & echo $$! > $(PID_FILE)

.PHONY: down
down:
	@if [ -f $(PID_FILE) ]; then \
		kill $$(cat $(PID_FILE)) && rm $(PID_FILE); \
	fi

.PHONY: logs
logs:
	tail -f frontend.log
