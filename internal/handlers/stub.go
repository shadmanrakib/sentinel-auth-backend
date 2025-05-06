package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func StubHandler(ctx *gin.Context) {
	ctx.JSON(http.StatusNotImplemented, gin.H{"message": "Need to implement!"})
}
